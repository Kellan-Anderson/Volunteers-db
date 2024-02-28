import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { filters, organizations, organizationsAndUsers, users } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";

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
			return orgs
		}),

	getCurrentOrganization: protectedProcedure
		.query(async ({ ctx }) => {
			const { id: userId, lastOrganizationId } = ctx.session.user;
			if(lastOrganizationId === null) {
				throw new Error('User has not joined or setup an organization')
			}
			const usersOrg = await ctx.db.query.organizationsAndUsers.findFirst({
				where: and(
					eq(organizationsAndUsers.userId, userId),
					eq(organizationsAndUsers.organizationId, lastOrganizationId)
				),
				with: {
					organization: {
						with: {
							filters: {
								where: eq(filters.organizationId, lastOrganizationId)
							}
						}
					}
				}
			});
			if(!usersOrg) {
				throw new Error('There was an issue finding the users organization')
			}
			return {
				permission: usersOrg.permission,
				organizationName: usersOrg.organization.organizationName,
				filters: usersOrg.organization.filters
			}
		})
})