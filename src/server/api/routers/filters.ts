import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { and, eq } from "drizzle-orm";
import { filters } from "~/server/db/schema";
import { randomId } from "~/lib/randomId";

export const categoriesRouter = createTRPCRouter({
	addFilter: protectedProcedure
		.input(z.object({
			name: z.string(),
			filterType: z.enum([ 'category', 'tag' ])
		}))
		.mutation(async ({ ctx, input }) => {
			const { lastOrganizationId } = ctx.session.user;
			if(!lastOrganizationId) throw new Error('User has not setup/joined an organization');
			const existingFilter = await ctx.db.query.filters.findFirst({
				where: and(
					eq(filters.organizationId, lastOrganizationId),
					eq(filters.name, input.name)
				)
			});
			if(existingFilter !== undefined) throw new Error('That category already exists');
			await ctx.db
				.insert(filters)
				.values({
					id: `category-${crypto.randomUUID()}`,
					urlId: randomId({ prefix: input.name.split(' ').join('-'), length: 4 }),
					organizationId: lastOrganizationId,
					name: input.name,
					filterType: input.filterType
				});
		}),

	getCategories: protectedProcedure
		.query(async ({ ctx }) => {
			const { lastOrganizationId } = ctx.session.user;
			if(!lastOrganizationId) throw new Error('User has not setup/joined an organization');
			const organizationsCategories = await ctx.db.query.filters.findMany({
				where: and(
					eq(filters.organizationId, lastOrganizationId),
					eq(filters.filterType, 'category')
				)
			});
			return organizationsCategories.map(cat => ({
				urlId: cat.urlId,
				name: cat.name
			}));
		}),

	getTags: protectedProcedure
		.query(async ({ ctx }) => {
			const { lastOrganizationId } = ctx.session.user;
			if(!lastOrganizationId) throw new Error('User has not setup/joined an organization');
			const organizationsTags = await ctx.db.query.filters.findMany({
				where: and(
					eq(filters.organizationId, lastOrganizationId),
					eq(filters.filterType, 'tag')
				)
			});
			return organizationsTags.map(cat => ({
				urlId: cat.urlId,
				name: cat.name
			}));
		})
})