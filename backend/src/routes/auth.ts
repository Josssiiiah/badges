import { Elysia } from "elysia";
import { auth as authInstance } from "../auth";

// Explicitly forward key Better Auth routes to its handler.
export const auth = new Elysia()
  .onRequest((c) => {
    try {
      const url = new URL(c.request.url);
      console.log(`[auth] incoming ${c.request.method} ${url.pathname}${url.search}`);
    } catch {
      console.log(`[auth] incoming ${c.request.method} <bad-url>`);
    }
  })
  .get("/api/auth/get-session", ({ request }) => authInstance.handler(request))
  .get("/api/auth/verify-email", ({ request }) => authInstance.handler(request))
  .post("/api/auth/sign-up/email", ({ request }) => authInstance.handler(request))
  // Magic link endpoints
  .post("/api/auth/sign-in/magic-link", ({ request }) => authInstance.handler(request))
  .get("/api/auth/magic-link/verify", ({ request }) => authInstance.handler(request));
