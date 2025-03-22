import { treaty } from "@elysiajs/eden";
import type { App } from "../../../backend/src/index";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
if (!BACKEND_URL) throw new Error("VITE_BACKEND_URL is not set");

export const server = treaty<App>(BACKEND_URL, {
  fetch: {
    credentials: "include",
  },
});

export const api = server.api;
