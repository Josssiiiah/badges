import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./routes/auth";
import { studentRoutes } from "./routes/students";
import { badgeRoutes } from "./routes/badges";
import { organizationRoutes } from "./routes/organizations";
import { userRoutes } from "./routes/users";
import { invitationRoutes } from "./routes/invitations";
import { join } from "path";
import { staticPlugin } from '@elysiajs/static'


// Create a new Elysia app
const app = new Elysia()
  // Global request logger
  .onRequest((c) => {
    try {
      const url = new URL(c.request.url);
      console.log(`[req] ${c.request.method} ${url.pathname}${url.search}`);
    } catch {
      console.log(`[req] ${c.request.method} <bad-url>`);
    }
  })
  // Global error logger
  .onError(({ request, code, error }) => {
    try {
      const url = new URL(request.url);
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`[error] code=${code} path=${url.pathname}${url.search} msg=${msg}`);
      if (error instanceof Error && error.stack) console.error(error.stack);
    } catch (err) {
      console.error(`[error] code=${code} msg=${error}`);
    }
  })
  .use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  }))
  // Mount Better Auth routes at root
  .use(auth)

  // Define API routes first - these take precedence (other than auth)
  .group("/api", (app) =>
    app
       .use(studentRoutes)
       .use(badgeRoutes)
       .use(organizationRoutes)
       .use(userRoutes)
       .use(invitationRoutes)
  )

  // Static assets
  .get("/assets/*", ({ params }) => {
    const star = (params as Record<string, string>)["*"] || "";
    const filePath = join(import.meta.dir, "../dist/assets", star);
    console.log(`Serving asset: ${filePath}`);
    if (!star) return new Response("Not Found", { status: 404 });
    return Bun.file(filePath);
  })
  // Serve SPA for all other routes
  .all("*", ({ path, request }) => {
    // Only serve the SPA if it's not an API route
    if (!path.startsWith("/api")) {
      return Bun.file(join(import.meta.dir, "../dist/index.html"));
    }
  })
  .use(
    staticPlugin({
      assets: join(import.meta.dir, "../dist"), // serve everything in /dist
      prefix: "",                               // at the web root
      indexHTML: true
    })
  );

app.listen(process.env.PORT || 3000);
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

// Export app type for Eden
export type App = typeof app;
