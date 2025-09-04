import { Elysia } from "elysia";
import { auth as authInstance } from "../auth";

// Forward ALL Better Auth routes to its handler
export const auth = new Elysia()
  .onRequest((c) => {
    try {
      const url = new URL(c.request.url);
      console.log(`[auth] incoming ${c.request.method} ${url.pathname}${url.search}`);
    } catch {
      console.log(`[auth] incoming ${c.request.method} <bad-url>`);
    }
  })
  // Handle all specific auth endpoints
  .get("/api/auth/get-session", ({ request }) => authInstance.handler(request))
  .get("/api/auth/verify-email", ({ request }) => authInstance.handler(request))
  .post("/api/auth/sign-up/email", ({ request }) => authInstance.handler(request))
  .post("/api/auth/sign-in/email", ({ request }) => authInstance.handler(request))
  .post("/api/auth/sign-out", ({ request }) => authInstance.handler(request))
  .post("/api/auth/update-user", ({ request }) => authInstance.handler(request))
  .post("/api/auth/delete-user", ({ request }) => authInstance.handler(request))
  .post("/api/auth/change-email", ({ request }) => authInstance.handler(request))
  .post("/api/auth/change-password", ({ request }) => authInstance.handler(request))
  .post("/api/auth/set-password", ({ request }) => authInstance.handler(request))
  .post("/api/auth/reset-password", ({ request }) => authInstance.handler(request))
  .post("/api/auth/send-reset-password", ({ request }) => authInstance.handler(request))
  .post("/api/auth/send-verification-email", ({ request }) => authInstance.handler(request))
  // Magic link endpoints
  .post("/api/auth/sign-in/magic-link", ({ request }) => authInstance.handler(request))
  .get("/api/auth/magic-link/verify", ({ request }) => authInstance.handler(request))
  // OAuth endpoints (if needed in future)
  .get("/api/auth/sign-in/social", ({ request }) => authInstance.handler(request))
  .get("/api/auth/callback/*", ({ request }) => authInstance.handler(request));
