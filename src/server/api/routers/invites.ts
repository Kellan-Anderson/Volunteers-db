import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { invites, organizations, organizationsAndUsers, users } from "~/server/db/schema";
import { randomId } from "~/lib/randomId";
import { env } from "~/env";
import { Resend } from "resend"
import { eq } from "drizzle-orm";
import { InviteEmail } from "~/components/emails/inviteEmail";
import { compareDates, createDate } from "~/lib/dates";

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
				.findFirst({ where: eq(organizations.id, organizationId)});
			if(!organization) throw new Error('Could not find the users organization')

			const inviteId = randomId({ prefix: 'invite' })
			await ctx.db
				.insert(invites)
				.values({
					...input,
					organizationId,
					id: inviteId,
					expiresAt: createDate(3, 'days', 'from now')
				});
			
			const host = ctx.headers.get('host');
			if(!host) throw new Error('Could not retrieve page host');

			const resend = new Resend(env.RESEND_API_KEY);
			const { error: resendError } = await resend.emails.send({
				from: `${organization.organizationName} <onboarding@resend.dev>`,
				subject: `You have been invited to join ${organization.organizationName}`,
				to: input.email,
				react: InviteEmail({
					expiresIn: createDate(3, 'days', 'from now'),
					link: `http://${host}/join-organization/${inviteId}`,
					name: input.name,
					organizationName: organization.organizationName,
					makeAdmin: input.makeAdmin
				})
			});
			console.log({ resendError })
		}),

	getInvite: publicProcedure
		.input(z.object({
			inviteCode: z.string()
		}))
		.query(async ({ ctx, input }) => {
			const invite = await ctx.db.query.invites.findFirst({
				where: eq(invites.id, input.inviteCode),
				with: {
					organization: true
				}
			});

			if(!invite) return null;

			return {
				name: invite.name,
				organizationName: invite.organization.organizationName,
				adminInvite: invite.makeAdmin,
				expired: compareDates(new Date(), 'after', invite.expiresAt)
			}
		}),

	makeDecision: protectedProcedure
		.input(z.object({
			inviteCode: z.string(),
			decision: z.enum(['join', 'deny'])
		}))
		.mutation(async ({ ctx, input }) => {
			const invite = await ctx.db.query.invites.findFirst({ where: eq(invites.id, input.inviteCode) })
			if(!invite) throw new Error('There was an error retrieving your invite')
			if(input.decision === 'join') {
				await Promise.all([
					ctx.db
						.insert(organizationsAndUsers)
						.values({
							organizationId: invite.organizationId,
							userId: ctx.session.user.id,
							permission: invite.makeAdmin ? 'admin' : 'user'
						}),
					ctx.db
						.update(users)
						.set({
							lastOrganizationId: invite.organizationId
						})
						.where(eq(users.id, ctx.session.user.id))
				])
			}
			await ctx.db
				.delete(invites)
				.where(eq(invites.id, input.inviteCode))
		})
})