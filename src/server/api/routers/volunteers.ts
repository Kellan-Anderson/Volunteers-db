import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { type SQL, and, eq, sql, inArray, asc, desc } from "drizzle-orm";
import { filters, filtersAndVolunteers, organizationsAndUsers, volunteers } from "~/server/db/schema";
import { randomId } from "~/lib/randomId";
import { filtersList, sortByParser } from "~/types";

export const volunteersRouter = createTRPCRouter({
	addVolunteer: protectedProcedure
		.input(z.object({
			name: z.string(),
			email: z.string(),
			phoneNumber: z.string().optional(),
			notes: z.string().optional(),
			profilePictureUrl: z.string().optional(),
			filters: filtersList,
		}))
		.mutation(async ({ ctx, input }) => {
			// Check to make sure that the user that is trying to add a volunteer has setup or joined and organization
			const { id: userId, lastOrganizationId } = ctx.session.user;
			if(!lastOrganizationId) throw new Error('User has not joined/setup organization')

			// Check by email that a volunteer has not been setup for the target organization
			const existingVolunteer = await ctx.db.query.volunteers.findFirst({
				where: and(
					eq(volunteers.email, input.email),
					eq(volunteers.organizationId, lastOrganizationId)
				)
			});
			if(existingVolunteer !== undefined) throw new Error('A user by that email already exists in this organization')

			// Construct the volunteer object and add it to the db
			const volunteerId = `volunteer-${crypto.randomUUID()}`;
			await ctx.db
				.insert(volunteers)
				.values({
					...input,
					id: volunteerId,
					createdBy: userId,
					organizationId: lastOrganizationId,
					url: randomId({ prefix: input.name.split(' ').join('-'), length: 4 }),
				});

			// Construct filter rows and add to db
			const filterRows = constructFilterRows(input.filters, volunteerId);
			if(filterRows.length !== 0)
				await ctx.db.insert(filtersAndVolunteers).values(filterRows);
		}),

	getVolunteers: protectedProcedure
		.input(z.object({
			query: z.string().optional(),
			filterUrlIds: z.string().array(),
			sortBy: sortByParser.default('name-asc')
		}))
		.query(async ({ ctx, input }) => {
			// Check to make sure that the user that is trying to add a volunteer has setup or joined and organization
			const { lastOrganizationId } = ctx.session.user;
			if(!lastOrganizationId) throw new Error('User has not joined/setup organization');

			const queryArray: SQL<unknown>[] = [ eq(volunteers.organizationId, lastOrganizationId) ];

			if(input.query) {
				queryArray.push(sql`to_tsvector('simple', ${volunteers.name}) @@ plainto_tsquery('simple', ${input.query})`)
			}
			if(input.filterUrlIds.length > 0) {
				queryArray.push(inArray(filters.urlId, input.filterUrlIds))
			}

			const organizationVolunteers = await ctx.db
				.select()
				.from(filtersAndVolunteers)
				.rightJoin(volunteers, eq(filtersAndVolunteers.volunteerId, volunteers.id))
				.leftJoin(filters, eq(filtersAndVolunteers.filterId, filters.id))
				.where(and(...queryArray))
				.orderBy(getSortingOrder(input.sortBy))

			const reducedVolunteers = organizationVolunteers.flatMap((vol, i) => {
				const index = organizationVolunteers.findIndex(row => row.volunteers.id === vol.volunteers.id);
				if(index === i) {
					return vol.volunteers
				}
				return []
			});

			return reducedVolunteers
		}),

	getVolunteerInformation: protectedProcedure
		.input(z.object({
			volunteerUrl: z.string()
		}))
		.query(async ({ ctx, input }) => {
			const volunteer = await ctx.db.query.volunteers.findFirst({
				where: eq(volunteers.url, input.volunteerUrl),
				with: {
					filters: {
						with: {
							filter: true
						}
					},
					createdBy: true,
				}
			});

			if(!volunteer) {
				throw new Error('That volunteer does not exist')
			}
			return {
				id: volunteer.id,
				name: volunteer.name,
				email: volunteer.email,
				createdBy: {
					name: volunteer.createdBy.name,
					id: volunteer.createdBy.id
				},
				url: volunteer.url,
				phoneNumber: volunteer.phoneNumber,
				notes: volunteer.notes,
				createdAt: volunteer.createdAt,
				profilePictureUrl: volunteer.profilePictureUrl,
				activeFilters: volunteer.filters.map(f => f.filter)
			}
		}),

	deleteVolunteer: protectedProcedure
		.input(z.object({
			volunteerId: z.string()
		}))
		.mutation(async ({ ctx, input }) => {
			const { lastOrganizationId } = ctx.session.user;
			if(!lastOrganizationId) throw new Error('User has not joined/setup organization');

			const userPermission = await ctx.db.query.organizationsAndUsers.findFirst({
				where: and(
					eq(organizationsAndUsers.userId, ctx.session.user.id),
					eq(organizationsAndUsers.organizationId, lastOrganizationId)
				)
			});

			if(userPermission?.permission !== 'admin') {
				throw new Error('User does not have permission to delete volunteers')
			}

			await ctx.db
				.delete(volunteers)
				.where(eq(volunteers.id, input.volunteerId))
		}),

		editVolunteer: protectedProcedure
			.input(z.object({
				volunteerId: z.string(),
				name: z.string(),
				email: z.string(),
				phoneNumber: z.string().optional(),
				notes: z.string().optional(),
				profilePictureUrl: z.string().optional(),
				filters: filtersList,
			}))
			.mutation(async ({ ctx, input }) => {
				// Check to make sure that the user that is trying to add a volunteer has setup or joined and organization
				const { lastOrganizationId } = ctx.session.user;
				if(!lastOrganizationId) throw new Error('User has not joined/setup organization');

				const volunteerCheck = await ctx.db.query.volunteers.findFirst({
					where: and(
						eq(volunteers.id, input.volunteerId),
						eq(volunteers.organizationId, lastOrganizationId)
					)
				});

				if(!volunteerCheck) {
					throw new Error('No volunteer by that id')
				}
				await Promise.all([
					ctx.db
						.update(volunteers)
						.set({
							email: input.email,
							name: input.name,
							notes: input.notes,
							phoneNumber: input.phoneNumber,
							profilePictureUrl: input.profilePictureUrl
						})
						.where(and(
							eq(volunteers.id, input.volunteerId),
							eq(volunteers.organizationId, lastOrganizationId)
						)),
					ctx.db
						.delete(filtersAndVolunteers)
						.where(eq(filtersAndVolunteers.volunteerId, input.volunteerId))
				]);

				if(input.filters.length > 0) {
					await ctx.db
						.insert(filtersAndVolunteers)
						.values(constructFilterRows(input.filters, input.volunteerId))
				}
			})
});

function getSortingOrder(order: z.infer<typeof sortByParser>) {
	switch(order) {
		case 'name-asc':
			return asc(volunteers.name)
		case 'name-desc':
			return desc(volunteers.name)
		case 'created-at-asc':
			return asc(volunteers.createdAt)
		case 'created-at-desc':
			return desc(volunteers.createdAt)
	}
}

function constructFilterRows(filters: z.infer<typeof filtersList>, vid: string) {
	return filters.flatMap(f => f.selected ? {
		filterId: f.id,
		volunteerId: vid
	} : []);
}