import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { invites, organizations } from "~/server/db/schema";
import { randomId } from "~/lib/randomId";
import { env } from "~/env";
import { Resend } from "resend"
import { eq } from "drizzle-orm";
import { InviteEmail } from "~/components/emails/inviteEmail";
import { createDate } from "~/lib/dates";

export const invitesRouter = createTRPCRouter({
	sendInvite: protectedProcedure
		.input(z.object({
			name: z.string(),
			email: z.string().email(),
			makeAdmin: z.boolean().default(false)
		}))
		.mutation(async ({ ctx, input }) => {

			const organizationId = ctx.session.user.lastOrganizationId;
			if(organizationId === null) throw new Error('You have not setup your organization');

			const organization = await ctx.db
				.query
				.organizations
				.findFirst({ where: eq(organizations, organizationId)});
			if(!organization) throw new Error('Could not find the users organization')

			const inviteId = randomId({ prefix: 'invite' })
			await ctx.db
				.insert(invites)
				.values({
					...input,
					organizationId,
					id: inviteId
				});
			
			const host = ctx.headers.get('host');
			if(!host) throw new Error('Could not retrieve page host');

			const resend = new Resend(env.RESEND_API_KEY);
			await resend.emails.send({
				from: `${organization.organizationName} <onboarding@resend.dev>`,
				subject: `You have been invited to join ${organization.organizationName}`,
				to: input.email,
				react: InviteEmail({
					expiresIn: createDate(3, 'days', 'from now'),
					link: `${host}/join-organization/${inviteId}`,
					name: input.name,
					organizationName: organization.organizationName,
					makeAdmin: input.makeAdmin
				})
			})
		})
})