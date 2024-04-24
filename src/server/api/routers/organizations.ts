import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { organizations, organizationsAndUsers, users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

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
			const { lastOrganizationId } = ctx.session.user;
			if(lastOrganizationId === null) {
				throw new Error('User has not joined or setup an organization')
			}

			let userPermission: 'user' | 'admin' = 'user';

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

			const organizationUsers = users.map(({ user, permission }) => {
				if(user.id === ctx.session.user.id) {
					userPermission = permission;
				}
				return {
					id: user.id,
					name: user.name,
					email: user.email,
					permission
				}
			})

			return {
				permission: userPermission,
				organizationName: organization.organizationName,
				filters: organization.filters,
				users: organizationUsers
			}
		}),
})