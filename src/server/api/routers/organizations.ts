import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { organizations, organizationsAndUsers, users, volunteers } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { Resend } from "resend";
import { env } from "~/env";
import { RemoveUserEmail } from "~/components/emails/removeUserEmail";
import { ChangePermissionsEmail } from "~/components/emails/changePermissionsEmail";
import { OrganizationDeletedEmail } from "~/components/emails/deleteOrganizationEmail";

export const organizationsRouter = createTRPCRouter({
	newOrganization: protectedProcedure
		.input(z.object({
			organizationName: z.string(),
		}))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const organizationId = `org-${crypto.randomUUID()}`
			await ctx.db
				.insert(organizations)
				.values({
					createdBy: userId,
					id: organizationId,
					organizationName: input.organizationName
				});

			await ctx.db
				.update(users)
				.set({
					lastOrganizationId: organizationId
				})
				.where(eq(users.id, userId));

			await ctx.db
				.insert(organizationsAndUsers)
				.values({
					organizationId,
					userId
				})
		}),

	getUsersOrganizations: protectedProcedure
		.query(async ({ ctx }) => {
			const userOrgs = await ctx.db.query.organizationsAndUsers.findMany({
				where: eq(organizationsAndUsers.userId, ctx.session.user.id),
				with: {
					organization: true
				}
			});
			const orgs = userOrgs.map(({ organization, permission }) => ({
				permission,
				name: organization.organizationName,
				id: organization.id,
			}));
			const { permission } = orgs.find(o => o.id === ctx.session.user.lastOrganizationId)!

			return {
				permission,
				organizations: orgs,
			}
		}),

	getCurrentOrganization: protectedProcedure
		.query(async ({ ctx }) => {
			const { lastOrganizationId, id: userId } = ctx.session.user;
			if(lastOrganizationId === null) {
				throw new Error('User has not joined or setup an organization')
			}

			const [organization, users] = await Promise.all([
				ctx.db.query.organizations.findFirst({
					where: eq(organizations.id, lastOrganizationId),
					with: { filters: true } 
				}),

				ctx.db.query.organizationsAndUsers.findMany({
					where: eq(organizationsAndUsers.organizationId, lastOrganizationId),
					with: {
						user: true
					}
				})
			]);

			if(!organization) {
				throw new Error('There was an issue finding the users organization')
			}

			const organizationUsers = users.flatMap(({ user, permission }) => {
				if(user.id === userId) return [];
				return {
					id: user.id,
					name: user.name,
					email: user.email,
					permission
				}
			});

			const userPermission = users.find(({ user }) => user.id === userId)?.permission ?? 'user'

			return {
				permission: userPermission,
				organizationName: organization.organizationName,
				filters: organization.filters,
				users: organizationUsers
			}
		}),

	changeOrganizationName: protectedProcedure
		.input(z.object({
			newName: z.string()
		}))
		.mutation(async ({ ctx, input }) => {
			const { lastOrganizationId, id: userId } = ctx.session.user;
			if(lastOrganizationId === null) {
				throw new Error('User has not joined or setup an organization')
			}

			const permissionCheck = await ctx.db.query.organizationsAndUsers.findFirst({
				where: and(
					eq(organizationsAndUsers.organizationId, lastOrganizationId),
					eq(organizationsAndUsers.userId, userId)
				)
			});

			if(permissionCheck?.permission !== 'owner')
				throw new Error('You ust be an owner to change organization details');

			await ctx.db
				.update(organizations)
				.set({ organizationName: input.newName })
				.where(eq(organizations.id, lastOrganizationId))
		}),

	deleteOrganization: protectedProcedure
		.mutation(async ({ ctx }) => {
			// Validate the user has been setup
			const { lastOrganizationId, id: userId } = ctx.session.user;
			if(lastOrganizationId === null) {
				throw new Error('User has not joined or setup an organization')
			}

			// Get details for the organization including emails and users
			const organizationDetails = await ctx.db.query.organizations.findFirst({
				where: eq(organizations.id, lastOrganizationId),
				with: {
					organizationsAndUsers: {
						with: {
							user: true
						}
					}
				}
			});

			if(!organizationDetails)
				throw new Error('There was an issue finding the organization to delete')

			const users = organizationDetails.organizationsAndUsers;

			if(users.find(u => u.user.id === userId)!.permission !== 'owner' )
				throw new Error('You ust be an owner to change organization details');

			// Delete the organization
			await ctx.db
				.delete(organizations)
				.where(eq(organizations.id, lastOrganizationId));

			// Email organization members
			const organizationUsersEmails = users.map(u => u.user.email);
			const organizationName = organizationDetails.organizationName;
			const resend = new Resend(env.RESEND_API_KEY);
			await resend.emails.send({
				to: organizationUsersEmails,
				from: `${organizationName} <onboarding@resend.dev>`,
				subject: 'Notification of organization removal',
				react: OrganizationDeletedEmail({ organizationName })
			})

		}),

	removeUser: protectedProcedure
		.input(z.object({
			userId: z.string()
		}))
		.mutation(async ({ ctx, input }) => {
			// Verify the user has setup an organization
			const { lastOrganizationId, id: userId } = ctx.session.user;
			if(!lastOrganizationId) throw new Error('User has not setup/joined an organization');

			const [requestingUser, targetUser] = await Promise.all([
				// Requesting user
				ctx.db.query.organizationsAndUsers.findFirst({
					where: and(
						eq(organizationsAndUsers.userId, userId),
						eq(organizationsAndUsers.organizationId, lastOrganizationId),
					),
					with: {
						organization: true,
						user: true
					}
				}),

				// Target user
				ctx.db.query.organizationsAndUsers.findFirst({
					where: and(
						eq(organizationsAndUsers.userId, input.userId),
						eq(organizationsAndUsers.organizationId, lastOrganizationId)
					),
					with: {
						user: true
					}
				}),
			])

			// Permissions check
			if(!targetUser || !requestingUser) throw new Error('There was an error validating the user');
			
			if(targetUser.permission === 'admin' && requestingUser.userId !== requestingUser.organization.createdBy) {
				throw new Error('Only the owner of the organization can remove admin members')
			}
			
			if(requestingUser?.permission !== 'admin')
				throw new Error('User must be an admin to remove other users');

			await ctx.db.delete(organizationsAndUsers).where(and(
				eq(organizationsAndUsers.userId, input.userId),
				eq(organizationsAndUsers.organizationId, lastOrganizationId),
			));

			const resend = new Resend(env.RESEND_API_KEY);
			await resend.emails.send({
				from: `${requestingUser.organization.organizationName} <onboarding@resend.dev>`,
				subject: 'Notification of removal',
				to: targetUser.user.email,
				react: RemoveUserEmail({
					name: targetUser.user.name,
					organizationName: requestingUser.organization.organizationName,
					organizationOwnerEmail: requestingUser.user.email
				})
			})
		}),

	changeUserPermission: protectedProcedure
		.input(z.object({
			userId: z.string(),
			newPermission: z.enum(['admin', 'user'])
		}))
		.mutation(async ({ ctx, input }) => {
			const { lastOrganizationId, id: userId } = ctx.session.user;
			if(!lastOrganizationId) throw new Error('User has not setup/joined an organization');

			const [requestingUser, targetUser] = await Promise.all([
				// Requesting user
				ctx.db.query.organizationsAndUsers.findFirst({
					where: and(
						eq(organizationsAndUsers.userId, userId),
						eq(organizationsAndUsers.organizationId, lastOrganizationId),
					),
					with: {
						organization: true,
						user: true
					}
				}),

				// Target user
				ctx.db.query.organizationsAndUsers.findFirst({
					where: and(
						eq(organizationsAndUsers.userId, input.userId),
						eq(organizationsAndUsers.organizationId, lastOrganizationId)
					),
					with: {
						user: true
					}
				}),
			])

			// Permissions check
			if(!targetUser || !requestingUser) throw new Error('There was an error validating the user');
			
			if(targetUser.permission === 'admin' && requestingUser.userId !== requestingUser.organization.createdBy) {
				throw new Error('Only the owner of the organization can change permissions of admin members')
			}
			
			if(requestingUser?.permission !== 'admin')
				throw new Error('User must be an admin to change the permissions of other users');

			await ctx.db
				.update(organizationsAndUsers)
				.set({ permission: input.newPermission })
				.where(and(
					eq(organizationsAndUsers.organizationId, lastOrganizationId),
					eq(organizationsAndUsers.userId, input.userId)
				));

			const resend = new Resend(env.RESEND_API_KEY);
			await resend.emails.send({
				from: `${requestingUser.organization.organizationName} <onboarding@resend.dev>`,
				subject: 'Notification of permission change',
				to: targetUser.user.email,
				react: ChangePermissionsEmail({
					name: targetUser.user.name,
					organizationName: requestingUser.organization.organizationName,
					newPermission: input.newPermission
				})
			})
		}),

	getUser: protectedProcedure
		.input(z.object({
			userId: z.string()
		}))
		.query(async ({ ctx, input }) => {
			const { lastOrganizationId } = ctx.session.user;
			if(!lastOrganizationId) throw new Error('User has not setup/joined an organization');

			const userInfo = await ctx.db.query.organizationsAndUsers.findFirst({
				where: eq(organizationsAndUsers.userId, input.userId),
				with: {
					user: true
				}
			});

			if(!userInfo)
				throw new Error('That user is not a member of this organization');

			const userVolunteers = await ctx.db.query.volunteers.findMany({
				where: and(
					eq(volunteers.createdBy, input.userId),
					eq(volunteers.organizationId, lastOrganizationId)
				)
			});

			return {
				permission: userInfo.permission,
				name: userInfo.user.name,
				email: userInfo.user.email,
				image: userInfo.user.image,
				volunteers: userVolunteers.map(({ id, name, createdAt, url }) => ({ id, name, createdAt, url }))
			}
		})
})