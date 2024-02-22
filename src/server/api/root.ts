import { createTRPCRouter } from "~/server/api/trpc";
import { organizationsRouter } from "./routers/organizations";
import { usersRouter } from "./routers/users";
import { invitesRouter } from "./routers/invites";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
*/
export const appRouter = createTRPCRouter({
  invites: invitesRouter,
  organizations: organizationsRouter,
  users: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
