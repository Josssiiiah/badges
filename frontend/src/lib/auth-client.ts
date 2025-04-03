import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

const BASE_URL = import.meta.env.VITE_BETTER_AUTH_URL;
if (!BASE_URL) throw new Error("VITE_BETTER_AUTH_URL is not set");

export const authClient = createAuthClient({
  baseURL: BASE_URL,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          defaultValue: "student",
        },
        organization: {
          type: "string",
        },
        organizationId: {
          type: "string",
        },
      },
    }),
  ],
});
