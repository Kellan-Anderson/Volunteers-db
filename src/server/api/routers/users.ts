import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const usersRouter = createTRPCRouter({
	updateLastOrganization: protectedProcedure
		.input(z.object({ orgId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(users)
				.set({ lastOrganizationId: input.orgId })
				.where(eq(users.id, ctx.session.user.id))
		})
})