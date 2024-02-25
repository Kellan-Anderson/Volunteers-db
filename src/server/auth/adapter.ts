import { db } from "~/server/db";
import { users, sessions, verificationTokens, accounts } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import type { Adapter } from "next-auth/adapters";

export const CustomAdapter: Adapter = {
	async createUser(data) {
		const id = crypto.randomUUID();
		const createdUser = await db.insert(users).values({
			id,
			...data
		}).returning();

		return createdUser[0]!
	},
	async getUser(data) {
		const user =
			(await db
				.select()
				.from(users)
				.where(eq(users.id, data))
				.then((res) => res[0])) ?? null;

		return user;
	},
	async getUserByEmail(data) {
		const user =
			(await db
				.select()
				.from(users)
				.where(eq(users.email, data))
				.then((res) => res[0])) ?? null;

		return user;
	},
	async createSession(data) {
		const foo = await db.insert(sessions).values(data).returning();

		return foo[0]!
	},
	async getSessionAndUser(data) {
		const sessionAndUser =
			(await db
				.select({
					session: sessions,
					user: users,
				})
				.from(sessions)
				.where(eq(sessions.sessionToken, data))
				.innerJoin(users, eq(users.id, sessions.userId))
				.then((res) => res[0])) ?? null;

		return sessionAndUser;
	},
	async updateUser(data) {
		if (!data.id) {
			throw new Error("No user id.");
		}
		const updatedUser = await db.update(users).set(data).where(eq(users.id, data.id)).returning();
		return updatedUser[0]!
	},
	async updateSession(data) {
		await db
			.update(sessions)
			.set(data)
			.where(eq(sessions.sessionToken, data.sessionToken));

		return await db
			.select()
			.from(sessions)
			.where(eq(sessions.sessionToken, data.sessionToken))
			.then((res) => res[0]);
	},
	async linkAccount(rawAccount) {
		const { type: rawType } = rawAccount;
		let type: 'oath' | 'oidc' | 'email';
		if(rawType === 'credentials') {
			type = 'oidc'
		}
		else if(rawType === 'oauth') {
			type = 'oath'
		} else {
			type = 'email'
		}

		await db.insert(accounts).values({
			...rawAccount,
			type,
		});
	},
	async getUserByAccount(account) {
		const dbAccount =
			(await db
				.select()
				.from(accounts)
				.where(
					and(
						eq(accounts.providerAccountId, account.providerAccountId),
						eq(accounts.provider, account.provider),
					),
				)
				.leftJoin(users, eq(accounts.userId, users.id))
				.then((res) => res[0])) ?? null;

		if (!dbAccount) {
			return null;
		}

		return dbAccount.user;
	},
	async deleteSession(sessionToken) {
		const session =
			(await db
				.select()
				.from(sessions)
				.where(eq(sessions.sessionToken, sessionToken))
				.then((res) => res[0])) ?? null;

		await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));

		return session;
	},
	async createVerificationToken(token) {
		await db.insert(verificationTokens).values(token);

		return await db
			.select()
			.from(verificationTokens)
			.where(eq(verificationTokens.identifier, token.identifier))
			.then((res) => res[0]);
	},
	async useVerificationToken(token) {
		try {
			const deletedToken =
				(await db
					.select()
					.from(verificationTokens)
					.where(
						and(
							eq(verificationTokens.identifier, token.identifier),
							eq(verificationTokens.token, token.token),
						),
					)
					.then((res) => res[0])) ?? null;

			await db
				.delete(verificationTokens)
				.where(
					and(
						eq(verificationTokens.identifier, token.identifier),
						eq(verificationTokens.token, token.token),
					),
				);

			return deletedToken;
		} catch (err) {
			throw new Error("No verification token found.");
		}
	},
	async deleteUser(id) {
		const user = await db
			.select()
			.from(users)
			.where(eq(users.id, id))
			.then((res) => res[0] ?? null);

		await db.delete(users).where(eq(users.id, id));

		return user;
	},
	async unlinkAccount(account) {
		await db
			.delete(accounts)
			.where(
				and(
					eq(accounts.providerAccountId, account.providerAccountId),
					eq(accounts.provider, account.provider),
				),
			);

		return undefined;
	},
}