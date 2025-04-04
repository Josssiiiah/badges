import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./routes/auth";
import { studentRoutes } from "./routes/students";
import { badgeRoutes } from "./routes/badges";
import { organizationRoutes } from "./routes/organizations";
import { userRoutes } from "./routes/users";
import { join } from "path";

// Create a new Elysia app
const app = new Elysia()
  .use(cors())
  // Define API routes first - these take precedence
  .group("/api", (app) => 
    app.use(auth)
       .use(studentRoutes)
       .use(badgeRoutes)
       .use(organizationRoutes)
       .use(userRoutes)
  )

  // Static assets
  .get("/assets/*", ({ params }) => {
    const filePath = join(import.meta.dir, "../dist/assets", params["*"]);
    console.log(`Serving asset: ${filePath}`);
    const file = Bun.file(filePath);
    return file;
  })

  // Serve SPA for all other routes
  .all("/*", ({ path, request }) => {
    // Only serve the SPA if it's not an API route
    if (!path.startsWith("/api")) {
      return Bun.file(join(import.meta.dir, "../dist/index.html"));
    }
  })
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

// Export app type for Eden
export type App = typeof app;
