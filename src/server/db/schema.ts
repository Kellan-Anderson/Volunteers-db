import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod"

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `volunteer_db_${name}`);

export const userRole = pgEnum('user_role', ['admin', 'user'])

export const users = createTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
  lastOrganizationId: varchar('last_organization', { length: 255 })
});

export const UserInsertSchema = createInsertSchema(users)

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  organizationsAndUsers: many(organizationsAndUsers),
  lastOrganization: one(organizations, {
    fields: [users.lastOrganizationId],
    references: [organizations.id]
  })
}));

export const AccountTypes = pgEnum('account_types', ['oath', 'oidc', 'email'])

export const accounts = createTable(
  "account",
  {
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: AccountTypes("type").notNull(),
      // varchar("type", { length: 255 })
      // .$type<AdapterAccount["type"]>()
      // .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_userId_idx").on(account.userId),
  })
);

export const AccountInsertSchema = createInsertSchema(accounts);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

export const VerificationTokenInsertSchema = createInsertSchema(verificationTokens)

/* ------------------------------------------------ Organizations --------------------------------------------------- */
export const organizations = createTable('organizations', {
  id: varchar('id', { length: 255 }).primaryKey(),
  organizationName: varchar('name', { length: 255 }).notNull(),
  createdBy: varchar('created_by', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' })
});

export const organizationsRelations = relations(organizations, ({ many }) => ({
  organizationsAndUsers: many(organizationsAndUsers)
}))

export const organizationsAndUsers = createTable('organizations_and_users', {
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: varchar('organization_id', { length: 255 }).notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  permission: userRole('role').notNull().default('user'),
});

export const organizationsAndUsersRelations = relations(organizationsAndUsers, ({ one }) => ({
  user: one(users, {
    fields: [organizationsAndUsers.userId],
    references: [users.id]
  }),
  organization: one(organizations, {
    fields: [organizationsAndUsers.organizationId],
    references: [organizations.id]
  })
}));

/* ------------------------------------------------ Invite Codes ---------------------------------------------------- */
export const invites = createTable('invites', {
  id: varchar('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email').notNull(),
  makeAdmin: boolean('make_admin').notNull().default(false),
  expiresAt: timestamp('expires_at').notNull(),
  organizationId: varchar('organization_id', { length: 255 }).notNull().references(() => organizations.id, { onDelete: "cascade" }),
});

export const invitesRelations = relations(invites, ({ one }) => ({
  organization: one(organizations, {
    fields: [invites.organizationId],
    references: [organizations.id]
  })
}))