import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { and, eq } from "drizzle-orm";
import { categoriesAndVolunteers, volunteers } from "~/server/db/schema";
import { randomId } from "~/lib/randomId";

export const volunteersRouter = createTRPCRouter({
	addVolunteer: protectedProcedure
		.input(z.object({
			name: z.string(),
			email: z.string(),
			phoneNumber: z.string().optional(),
			notes: z.string().optional(),
			profilePictureUrl: z.string().optional(),
			categories: z.string().array()
		}))
		.mutation(async ({ ctx, input }) => {
			const { id: userId, lastOrganizationId } = ctx.session.user;
			if(!lastOrganizationId) throw new Error('User has not joined/setup organization')
			const existingVolunteer = await ctx.db.query.volunteers.findFirst({
				where: and(
					eq(volunteers.email, input.email),
					eq(volunteers.organizationId, lastOrganizationId)
				)
			});
			if(existingVolunteer !== undefined) throw new Error('A user by that email already exists in this organization')
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

			const categoriesAndVolunteersRows = input.categories.map(cat => ({
				categoryId: cat,
				volunteerId
			}));
			console.log({ categoriesAndVolunteersRows });
			await ctx.db
				.insert(categoriesAndVolunteers)
				.values(categoriesAndVolunteersRows)
		})
})