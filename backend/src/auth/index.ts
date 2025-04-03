import { db } from "../db/connection";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { account, session, user, verification } from "../db/schema";
import { APIError } from "better-auth/api";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    // We're using Drizzle as our database
    provider: "sqlite",
    /*
     * Map your schema into a better-auth schema
     */
    schema: {
      user,
      session,
      verification,
      account,
    },
  }),
  cookie: {
    secure: true,
  },
  emailAndPassword: {
    enabled: true, // If you want to use email and password auth
    autoSignIn: false, // Disable automatic sign in after signup
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "student",
        input: true,
      },
      organization: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (userData, ctx) => {
          // Extract role and organization from ctx?.params
          console.log("Database Hook - userData:", JSON.stringify(userData));
          console.log("Database Hook - ctx:", ctx ? JSON.stringify({
            method: ctx.method,
            path: ctx.path,
            params: ctx.params,
            body: ctx.body
          }) : "undefined");
          
          const params = ctx?.params || {};
          const { additionalFields } = ctx?.body || {};
          console.log("Database Hook - additionalFields:", additionalFields);
          
          // Try to get role and organization from different possible sources
          const role = params.role || (additionalFields && additionalFields.role) || (userData as any).role;
          const organization = params.organization || (additionalFields && additionalFields.organization) || (userData as any).organization;
          
          console.log("Extracted role:", role, "and organization:", organization);
          
          // Validate role and organization
          if (role && !["student", "administrator"].includes(role)) {
            throw new APIError("BAD_REQUEST", {
              message: "Invalid role. Must be 'student' or 'administrator'.",
            });
          }
          
          if (role === "administrator" && !organization) {
            throw new APIError("BAD_REQUEST", {
              message: "Organization is required for administrator accounts.",
            });
          }
          
          console.log("Creating user with role:", role, "and organization:", organization);
          
          // Add role and organization to the user data
          return {
            data: {
              ...userData,
              role: role || "student",
              organization: organization || null,
            },
          };
        },
        after: async (user) => {
          console.log("Created user:", user);
        },
      },
    },
  },
  trustedOrigins: [
    "http://localhost:3001", // Frontend origin
    "http://localhost:3000", // Backend origin
    "https://badges-production.up.railway.app",
  ],
});
