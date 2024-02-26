import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { and, eq } from "drizzle-orm";
import { categories } from "~/server/db/schema";
import { randomId } from "~/lib/randomId";

export const categoriesRouter = createTRPCRouter({
	addCategory: protectedProcedure
		.input(z.object({
			name: z.string()
		}))
		.mutation(async ({ ctx, input }) => {
			const { lastOrganizationId } = ctx.session.user;
			if(!lastOrganizationId) throw new Error('User has not setup/joined an organization');
			const existingCategory = await ctx.db.query.categories.findFirst({
				where: and(
					eq(categories.organizationId, lastOrganizationId),
					eq(categories.name, input.name)
				)
			});
			if(existingCategory !== undefined) throw new Error('That category already exists');
			await ctx.db
				.insert(categories)
				.values({
					id: `category-${crypto.randomUUID()}`,
					urlId: randomId({ prefix: input.name.split(' ').join('-'), length: 4 }),
					organizationId: lastOrganizationId,
					name: input.name
				});
		}),

	getCategories: protectedProcedure
		.query(async ({ ctx }) => {
			const { lastOrganizationId } = ctx.session.user;
			if(!lastOrganizationId) throw new Error('User has not setup/joined an organization');
			const organizationsCategories = await ctx.db.query.categories.findMany({
				where: eq(categories.organizationId, lastOrganizationId)
			});
			return organizationsCategories.map(cat => ({
				urlId: cat.urlId,
				name: cat.name
			}));
		})
})