import { Elysia } from "elysia";
import betterAuthView from "../auth/auth-view";

export const auth = new Elysia({ prefix: "/auth" }).all(
  "/*",
  betterAuthView,
);
