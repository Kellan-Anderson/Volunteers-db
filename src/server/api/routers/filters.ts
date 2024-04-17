import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { and, eq } from "drizzle-orm";
import { filters, organizationsAndUsers } from "~/server/db/schema";
import { randomId } from "~/lib/randomId";

export const filterRouter = createTRPCRouter({
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
			if(existingFilter !== undefined) throw new Error('That filter already exists');
			const filter = {
				id: `${input.filterType}-${crypto.randomUUID()}`,
				urlId: randomId({ prefix: input.name.split(' ').join('-'), length: 4 }),
				organizationId: lastOrganizationId,
				name: input.name,
				filterType: input.filterType
			}
			await ctx.db
				.insert(filters)
				.values(filter);

			return filter;
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
		}),

	getAllFilters: protectedProcedure
		.query(async ({ ctx }) => {
			const { lastOrganizationId } = ctx.session.user;
			if(!lastOrganizationId) throw new Error('User has not setup/joined an organization');

			const allFilters = await ctx.db.query.filters.findMany({ where: eq(filters.organizationId, lastOrganizationId)})
			return allFilters
		}),

	getAllFiltersWithDetails: protectedProcedure
		.query(async ({ ctx }) => {
			const { lastOrganizationId } = ctx.session.user;
			if(!lastOrganizationId) throw new Error('User has not setup/joined an organization');

			const organizationFilters = await ctx.db.query.filters.findMany({
				where: eq(filters.organizationId, lastOrganizationId),
				with: {
					volunteers: {
						with: {
							volunteer: true
						}
					}
				}
			});

			const cleanedFilters = organizationFilters.map(f => ({
				name: f.name,
				type: f.filterType,
				numVolunteers: f.volunteers.length
			}));

			return cleanedFilters
		}),

	getSingleFilterDetails: protectedProcedure
		.input(z.object({ filterId: z.string() }))
		.query(async ({ ctx, input }) => {
			const { lastOrganizationId } = ctx.session.user;
			if(!lastOrganizationId) throw new Error('User has not setup/joined an organization');

			const targetFilter = await ctx.db.query.filters.findFirst({
				where: and(
					eq(filters.organizationId, lastOrganizationId),
					eq(filters.id, input.filterId)
				),
				with: {
					volunteers: { with: { volunteer: true } }
				}
			});

			if(!targetFilter) return undefined

			return {
				name: targetFilter.name,
				type: targetFilter.filterType,
				volunteers: targetFilter.volunteers.map(v => ({ name: v.volunteer.name }))
			}
		}),

	editFilterName: protectedProcedure
		.input(z.object({ filterId: z.string(), newName: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { lastOrganizationId } = ctx.session.user;
			if(!lastOrganizationId) throw new Error('User has not setup/joined an organization');

			const filterVerification = await ctx.db.query.filters.findFirst({ where: eq(filters.id, input.filterId) })
			if(filterVerification?.filterType === 'tag') {
				throw new Error('Tags can only be edited, not deleted')
			}

			await ctx.db
				.update(filters)
				.set({ name: input.newName })
				.where(
					and(
						eq(filters.organizationId, lastOrganizationId),
						eq(filters.id, input.filterId)
					)
				)
		}),

		deleteFilter: protectedProcedure
			.input(z.object({filterId: z.string()}))
			.mutation(async ({ ctx, input }) => {
				const { lastOrganizationId } = ctx.session.user;
				if(!lastOrganizationId) throw new Error('User has not setup/joined an organization');

				const userVerification = await ctx.db.query.organizationsAndUsers.findFirst({
					where: and(
						eq(organizationsAndUsers.organizationId, lastOrganizationId),
						eq(organizationsAndUsers.userId, ctx.session.user.id)
					)
				});
				if(!userVerification || userVerification.permission !== 'admin') {
					throw new Error('You do not have permission to delete this filter')
				}

				await ctx.db.delete(filters).where(and(
					eq(filters.organizationId, lastOrganizationId),
					eq(filters.id, input.filterId)
				));
			})
})