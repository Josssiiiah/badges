import { db } from "../db/connection";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { account, session, user, verification, organizations, organizationUsers } from "../db/schema";
import { APIError } from "better-auth/api";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

// Extended user type that includes our custom fields
interface ExtendedUser {
  id: string;
  name?: string;
  email?: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  role?: string;
  organization?: string;
  organizationId?: string;
}

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
      organizationId: {
        type: "string",
        required: false,
        input: false,
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
          
          let organizationId = null;
          
          // If the user is an administrator and has an organization, create or retrieve the organization
          if (role === "administrator" && organization) {
            try {
              // First check if organization already exists with this name
              const existingOrgs = await db
                .select({ id: organizations.id })
                .from(organizations)
                .where(eq(organizations.name, organization));
              
              // If organization exists, use its ID
              if (existingOrgs.length > 0) {
                organizationId = existingOrgs[0].id;
                console.log("Using existing organization with ID:", organizationId);
              } else {
                // Create a new organization record if it doesn't exist
                const orgResult = await db.insert(organizations)
                  .values({
                    id: nanoid(),
                    name: organization,
                  })
                  .returning();
                
                if (orgResult.length > 0) {
                  organizationId = orgResult[0].id;
                  console.log("Created new organization with ID:", organizationId);
                } else {
                  console.error("Failed to create organization record");
                }
              }
            } catch (error) {
              console.error("Error handling organization:", error);
              throw new APIError("INTERNAL_SERVER_ERROR", {
                message: "Failed to process organization record.",
              });
            }
          }
          
          console.log("Creating user with role:", role, "organization:", organization, "and organizationId:", organizationId);
          
          // Add role, organization and organizationId to the user data
          return {
            data: {
              ...userData,
              role: role || "student",
              organization: organization || null,
              organizationId: organizationId,
            },
          };
        },
        after: async (user) => {
          console.log("Created user:", user);
          
          // Add user to organization_users table if they have an organizationId
          const extendedUser = user as unknown as ExtendedUser;
          if (extendedUser.organizationId) {
            try {
              // Ensure role is a valid enum value
              const role = (extendedUser.role === "administrator" || extendedUser.role === "student") 
                ? extendedUser.role 
                : "student";
                
              await db.insert(organizationUsers)
                .values({
                  organizationId: extendedUser.organizationId,
                  userId: extendedUser.id,
                  role: role,
                })
                .returning();
              console.log(`Added user ${extendedUser.id} to organization ${extendedUser.organizationId}`);
            } catch (error) {
              console.error("Error adding user to organization:", error);
            }
          }
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
