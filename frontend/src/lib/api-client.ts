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

// Helper function for authenticated API requests
export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${BACKEND_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  // Don't add Content-Type for FormData (multipart/form-data)
  const hasFormData = options.body instanceof FormData;

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.headers || {}),
      // Only add Content-Type: application/json for POST/PUT requests that aren't FormData
      ...(!hasFormData &&
      (options.method === "POST" || options.method === "PUT")
        ? { "Content-Type": "application/json" }
        : {}),
    },
  });

  return response;
};
