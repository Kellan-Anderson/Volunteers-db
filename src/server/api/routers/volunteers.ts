import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { and, eq, sql } from "drizzle-orm";
import { filters, filtersAndVolunteers, volunteers } from "~/server/db/schema";
import { randomId } from "~/lib/randomId";
import { filtersParser } from "~/types";

export const volunteersRouter = createTRPCRouter({
	addVolunteer: protectedProcedure
		.input(z.object({
			name: z.string(),
			email: z.string(),
			phoneNumber: z.string().optional(),
			notes: z.string().optional(),
			profilePictureUrl: z.string().optional(),
			filters: filtersParser.array(),
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
			const filterRows = input.filters.flatMap(f => f.selected ? {
				filterId: f.id,
				volunteerId
			} : []);
			await ctx.db.insert(filtersAndVolunteers).values(filterRows);
		}),

	getVolunteers: protectedProcedure
		.query(async ({ ctx }) => {
			// Check to make sure that the user that is trying to add a volunteer has setup or joined and organization
			const { lastOrganizationId } = ctx.session.user;
			if(!lastOrganizationId) throw new Error('User has not joined/setup organization');

			const organizationVolunteers = await ctx.db
				.select()
				.from(filtersAndVolunteers)
				.rightJoin(volunteers, eq(filtersAndVolunteers.volunteerId, volunteers.id))
				.leftJoin(filters, eq(filtersAndVolunteers.filterId, filters.id))
				.where(eq(volunteers.organizationId, lastOrganizationId))

			const reducedVolunteers = organizationVolunteers.flatMap((vol, i) => {
				const index = organizationVolunteers.findIndex(row => row.volunteers.id === vol.volunteers.id);
				if(index === i) {
					return vol.volunteers
				}
				return []
			});

			return reducedVolunteers
		})
})