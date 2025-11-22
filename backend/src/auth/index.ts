import { db } from "../db/connection";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { account, session, user, verification, organizations, organizationUsers } from "../db/schema";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { sendVerificationEmail, sendMagicLinkEmail } from "../services/email";

// Helper to generate a random short code for organizations
function generateShortCode() {
  // Generate a 6-character alphanumeric code
  return nanoid(6).toUpperCase();
}

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
  baseURL: process.env.BETTER_AUTH_URL,
  cookie: {
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  },
  emailAndPassword: {
    enabled: true, // If you want to use email and password auth
    autoSignIn: false, // Disable automatic sign in after signup
    requireEmailVerification: true,
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const path = ctx.path;
      const response = ctx.context.returned as any;
      
      // Check if there's an error response
      if (response?.body?.code) {
        // Custom error for sign-in failures
        if (path === "/sign-in/email") {
          if (response.body.code === "INVALID_EMAIL_OR_PASSWORD") {
            // Check if it's because the user doesn't exist or wrong password
            const userEmail = ctx.body?.email;
            if (userEmail) {
              const existingUser = await db
                .select({ id: user.id, emailVerified: user.emailVerified })
                .from(user)
                .where(eq(user.email, userEmail))
                .limit(1);
              
              if (existingUser.length === 0) {
                throw new APIError("UNAUTHORIZED", {
                  message: "Account not found. Please check your email address or create a new account.",
                });
              } else if (!existingUser[0].emailVerified) {
                throw new APIError("UNAUTHORIZED", {
                  message: "Account not verified. Please check your email for the verification link.",
                });
              } else {
                throw new APIError("UNAUTHORIZED", {
                  message: "Incorrect password. Please try again.",
                });
              }
            }
          }
        }
        
        // Custom error for sign-up failures
        if (path === "/sign-up/email") {
          if (response.body.code === "USER_ALREADY_EXISTS") {
            throw new APIError("BAD_REQUEST", {
              message: "An account with this email already exists. Please sign in instead.",
            });
          }
        }
      }
    }),
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      // Skip sending verification email for student accounts
      // They'll get the magic link when badge is assigned instead
      if ((user as any).role === 'student') {
        console.log(`[auth] Skipping verification email for student: ${user.email} - will send magic link when badge is assigned`);
        return; // Don't send the email
      }
      
      // For non-students (administrators), send verification email normally
      // Ensure post-verify redirect goes to frontend origin
      const u = new URL(url);
      u.searchParams.set(
        "callbackURL",
        (process.env.FRONTEND_URL || "http://localhost:3001") + "/"
      );
      console.log(`[auth] verification link for ${user.email}: ${u.toString()}`);
      await sendVerificationEmail({ to: user.email, verificationUrl: u.toString() });
    },
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
      shortCode: {
        type: "string",
        required: false,
        input: true,
      },
      orgOption: {
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
          const params = ctx?.params || {};
          const { additionalFields } = ctx?.body || {};
          
          // Try to get role and organization from different possible sources
          const role = params.role || (additionalFields && additionalFields.role) || (userData as any).role;
          const organization = params.organization || (additionalFields && additionalFields.organization) || (userData as any).organization;
          
          // Get the new fields for the organization flow
          const orgOption = params.orgOption || (additionalFields && additionalFields.orgOption);
          const shortCode = params.shortCode || (additionalFields && additionalFields.shortCode);
          
          // Validate role
          if (role && !["student", "administrator"].includes(role)) {
            throw new APIError("BAD_REQUEST", {
              message: "Invalid role. Must be 'student' or 'administrator'.",
            });
          }
          
          let organizationId = null;
          
          // Handle administrator accounts based on orgOption
          if (role === "administrator") {
            if (orgOption === "create") {
              // Creating a new organization
              if (!organization) {
                throw new APIError("BAD_REQUEST", {
                  message: "Organization name is required when creating a new organization.",
                });
              }
              
              try {
                // Check if organization already exists with this name
                const existingOrgs = await db
                  .select({ id: organizations.id })
                  .from(organizations)
                  .where(eq(organizations.name, organization));
                
                if (existingOrgs.length > 0) {
                  // Organization with this name already exists, use it
                  organizationId = existingOrgs[0].id;
                } else {
                  // Create a new organization with a unique short code
                  const newShortCode = generateShortCode();
                  const orgResult = await db.insert(organizations)
                    .values({
                      id: nanoid(),
                      name: organization,
                      short_code: newShortCode
                    })
                    .returning();
                  
                  if (orgResult.length > 0) {
                    organizationId = orgResult[0].id;
                  } else {
                    throw new APIError("INTERNAL_SERVER_ERROR", {
                      message: "Failed to create organization.",
                    });
                  }
                }
              } catch (error) {
                throw new APIError("INTERNAL_SERVER_ERROR", {
                  message: "Failed to process organization record.",
                });
              }
            } else if (orgOption === "join") {
              // Joining an existing organization
              if (!shortCode) {
                throw new APIError("BAD_REQUEST", {
                  message: "Organization short code is required when joining an existing organization.",
                });
              }
              
              try {
                // Find organization by short code
                const existingOrgs = await db
                  .select({ id: organizations.id, name: organizations.name })
                  .from(organizations)
                  .where(eq(organizations.short_code, shortCode));
                
                if (existingOrgs.length === 0) {
                  throw new APIError("BAD_REQUEST", {
                    message: "No organization found with the provided short code.",
                  });
                }
                
                organizationId = existingOrgs[0].id;
              } catch (error) {
                throw new APIError("INTERNAL_SERVER_ERROR", {
                  message: "Failed to verify organization short code.",
                });
              }
            } else if (!orgOption) {
              // Backwards compatibility for old flow if no orgOption specified
              if (organization) {
                try {
                  // Check if organization already exists with this name
                  const existingOrgs = await db
                    .select({ id: organizations.id })
                    .from(organizations)
                    .where(eq(organizations.name, organization));
                  
                  if (existingOrgs.length > 0) {
                    organizationId = existingOrgs[0].id;
                  } else {
                    // Create a new organization with a unique short code
                    const newShortCode = generateShortCode();
                    const orgResult = await db.insert(organizations)
                      .values({
                        id: nanoid(),
                        name: organization,
                        short_code: newShortCode
                      })
                      .returning();
                    
                    if (orgResult.length > 0) {
                      organizationId = orgResult[0].id;
                    }
                  }
                } catch (error) {
                  throw new APIError("INTERNAL_SERVER_ERROR", {
                    message: "Failed to process organization record.",
                  });
                }
              }
            } else {
              throw new APIError("BAD_REQUEST", {
                message: "Invalid organization option. Must be 'create' or 'join'.",
              });
            }
          }
          
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
            } catch (error) {
              // We don't want to fail if this fails, as user is already created
            }
          }
        },
      },
    },
  },
  trustedOrigins: [
    "http://localhost:3001", // Frontend origin
    "http://localhost:3000", // Backend origin
    "https://badgespot.com", // Production frontend
  ],
  session: {
    // Ensure fresh sessions are created for magic links
    cookieCache: {
      enabled: false, // Disable cookie caching to prevent stale sessions
    },
  },
  plugins: [
    magicLink({
      expiresIn: 30 * 24 * 60 * 60, // 30 days
      sendMagicLink: async ({ email, url }) => {
        // Preserve provided callbackURL if present; otherwise default to frontend root
        const u = new URL(url);
        if (!u.searchParams.get("callbackURL")) {
          u.searchParams.set(
            "callbackURL",
            (process.env.FRONTEND_URL || "http://localhost:3001") + "/"
          );
        }
        console.log(`[auth] magic link for ${email}: ${u.toString()}`);
        await sendMagicLinkEmail({ to: email, magicLinkUrl: u.toString() });
      },
    }),
  ],
});

export type AuthInstance = typeof auth;
