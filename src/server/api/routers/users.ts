import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { organizationsAndUsers, users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const usersRouter = createTRPCRouter({
	updateLastOrganization: protectedProcedure
		.input(z.object({ orgId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(users)
				.set({ lastOrganizationId: input.orgId })
				.where(eq(users.id, ctx.session.user.id))
		}),

	resetLastOrganization: protectedProcedure
		.mutation(async ({ ctx }) => {
			const userId = ctx.session.user.id;
			const nextOrganization = await ctx.db.query.organizationsAndUsers.findFirst({
				where: eq(organizationsAndUsers.userId, userId)
			});

			let redirect: string | undefined = undefined;
			if(!nextOrganization?.organizationId) {
				redirect = '/new-organization';
			} else {
				await ctx.db
					.update(users)
					.set({ lastOrganizationId: nextOrganization.organizationId })
					.where(eq(users.id, userId))
			}

			return { redirect, newLastOrganizationId: nextOrganization!.organizationId }
		}),

	changeName: protectedProcedure
		.input(z.object({
			newName: z.string()
		}))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(users)
				.set({ name: input.newName })
				.where(eq(users.id, ctx.session.user.id))
		}),

	deleteAccount: protectedProcedure
		.mutation(async ({ ctx }) => {
			await ctx.db
				.delete(users)
				.where(eq(users.id, ctx.session.user.id))
		})
})