import { createTRPCRouter } from "~/server/api/trpc";
import { organizationsRouter } from "./routers/organizations";
import { usersRouter } from "./routers/users";
import { invitesRouter } from "./routers/invites";
import { volunteersRouter } from "./routers/volunteers";
import { categoriesRouter } from "./routers/categories";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
*/
export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  invites: invitesRouter,
  organizations: organizationsRouter,
  volunteers: volunteersRouter,
  users: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
