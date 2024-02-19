import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { organizations, users } from "~/server/db/schema";
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
				.where(eq(users.id, userId))
		})
})