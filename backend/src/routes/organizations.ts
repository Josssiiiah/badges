import { Elysia, t } from "elysia";
import { db } from "../db/connection";
import { organizationUsers, user, organizations } from "../db/schema";
import { eq } from "drizzle-orm";
import { setup } from "../setup";
import { userMiddleware } from "../middleware/auth-middleware";

export const organizationRoutes = new Elysia({ prefix: "/organizations" })
  .use(setup)
  // Health check endpoint
  .get("/health", () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString()
    };
  })
  // Get current user's organization details
  .get("/current", async (context) => {
    try {
      console.log("Fetching current organization details");
      
      // Ensure we always set the content type to JSON
      context.set.headers['content-type'] = 'application/json';
      
      const session = await userMiddleware(context);
      console.log("Session user for current org:", session.user ? {
        id: session.user.id,
        organization: session.user.organization,
        organizationId: session.user.organizationId
      } : "No user in session");
      
      if (!session.user) {
        console.log("Unauthorized access attempt - no user in session");
        context.set.status = 401;
        return { error: "Unauthorized", organization: null };
      }
      if (session.user.emailVerified === false) {
        context.set.status = 403;
        return { error: "Email not verified", organization: null };
      }
      
      if (!session.user.organizationId) {
        console.log("User has no organization ID");
        return { organization: null };
      }
      
      // Get organization details
      const organizationData = await db
        .select({
          id: organizations.id,
          name: organizations.name,
          short_code: organizations.short_code,
          createdAt: organizations.createdAt
        })
        .from(organizations)
        .where(eq(organizations.id, session.user.organizationId))
        .limit(1);
        
      if (organizationData.length === 0) {
        console.log("Organization not found");
        return { organization: null };
      }
      
      console.log("Found organization:", organizationData[0]);
      return { organization: organizationData[0] };
    } catch (error) {
      console.error("Error fetching current organization:", error);
      context.set.status = 500;
      context.set.headers['content-type'] = 'application/json';
      return { 
        error: String(error), 
        organization: null 
      };
    }
  })
  // Endpoint to get users for an organization
  .get("/:organizationId/users", async (context) => {
    try {
      const { params } = context;
      console.log(`Received request for organization users: ${params.organizationId}`);
      
      // Ensure we always set the content type to JSON
      context.set.headers['content-type'] = 'application/json';
      
      const session = await userMiddleware(context);
      console.log("Session user:", session.user ? {
        id: session.user.id,
        role: session.user.role,
        organization: session.user.organization,
        organizationId: session.user.organizationId
      } : "No user in session");
      
      if (!session.user) {
        console.log("Unauthorized access attempt - no user in session");
        context.set.status = 401;
        return { error: "Unauthorized", users: [] };
      }
      if (session.user.emailVerified === false) {
        context.set.status = 403;
        return { error: "Email not verified", users: [] };
      }
      
      // Verify that the user has access to this organization
      console.log(`Comparing user's org ID: ${session.user.organizationId} with requested org ID: ${params.organizationId}`);
      if (session.user.organizationId !== params.organizationId) {
        console.log("Unauthorized access - organization ID mismatch");
        context.set.status = 403;
        return { error: "Unauthorized access to organization data", users: [] };
      }

      // Join organizationUsers and user tables to get user details
      const organizationUsersData = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: organizationUsers.role,
          createdAt: user.createdAt,
        })
        .from(organizationUsers)
        .innerJoin(user, eq(organizationUsers.userId, user.id))
        .where(eq(organizationUsers.organizationId, params.organizationId));

      return {
        users: organizationUsersData,
      };
    } catch (error) {
      console.error("Error fetching organization users:", error);
      context.set.status = 500;
      context.set.headers['content-type'] = 'application/json';
      return { 
        error: String(error), 
        users: [] 
      };
    }
  }, {
    params: t.Object({
      organizationId: t.String(),
    }),
  }); 
