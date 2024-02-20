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
			const orgs = userOrgs.map(({ organization }) => ({
				name: organization.organizationName,
				id: organization.id
			}));
			return orgs
		})
})