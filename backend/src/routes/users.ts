import { Elysia, t } from "elysia";
import { db } from "../db/connection";
import { user } from "../db/schema";
import { eq } from "drizzle-orm";
import { setup } from "../setup";
import { userMiddleware } from "../middleware/auth-middleware";

export const userRoutes = new Elysia({ prefix: "/users" })
  .use(setup)
  // Get current user profile
  .get("/profile", async (context) => {
    try {
      // Ensure the user is authenticated
      const session = await userMiddleware(context);
      if (!session.user) {
        context.set.status = 401;
        return { error: "Unauthorized" };
      }
      
      // Fetch the user's complete profile
      const userData = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          biography: user.biography,
          organization: user.organization,
          image: user.image,
        })
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1);
      
      if (userData.length === 0) {
        return { user: null };
      }
      
      return { user: userData[0] };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      context.set.status = 500;
      return { error: String(error) };
    }
  })
  // Find a user by email
  .get("/by-email", async (context) => {
    try {
      const { query } = context;
      const { email } = query;
      
      if (!email) {
        context.set.status = 400;
        return { error: "Email parameter is required" };
      }
      
      // Ensure the user is authenticated
      const session = await userMiddleware(context);
      if (!session.user) {
        context.set.status = 401;
        return { error: "Unauthorized" };
      }
      
      // Find the user by email
      const userData = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        })
        .from(user)
        .where(eq(user.email, email))
        .limit(1);
      
      if (userData.length === 0) {
        return { user: null };
      }
      
      return { user: userData[0] };
    } catch (error) {
      console.error("Error finding user by email:", error);
      context.set.status = 500;
      return { error: String(error) };
    }
  }, {
    query: t.Object({
      email: t.String(),
    }),
  })
  // Find a user by username (name)
  .get("/by-username", async (context) => {
    try {
      const { query } = context;
      const { username } = query;
      
      if (!username) {
        context.set.status = 400;
        return { error: "Username parameter is required" };
      }
      
      // Ensure the user is authenticated
      const session = await userMiddleware(context);
      if (!session.user) {
        context.set.status = 401;
        return { error: "Unauthorized" };
      }
      
      // Find the user by username (name)
      const userData = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          biography: user.biography,
          organization: user.organization,
        })
        .from(user)
        .where(eq(user.name, username))
        .limit(1);
      
      if (userData.length === 0) {
        return { user: null };
      }
      
      return { user: userData[0] };
    } catch (error) {
      console.error("Error finding user by username:", error);
      context.set.status = 500;
      return { error: String(error) };
    }
  }, {
    query: t.Object({
      username: t.String(),
    }),
  })
  // Update user biography
  .post("/update-biography", async (context) => {
    try {
      // Ensure the user is authenticated
      const session = await userMiddleware(context);
      if (!session.user) {
        context.set.status = 401;
        return { error: "Unauthorized" };
      }
      
      const { biography } = context.body;
      
      // Validate biography length
      if (biography.length > 300) {
        context.set.status = 400;
        return { error: "Biography must be 300 characters or less" };
      }
      
      // Update the user's biography
      await db
        .update(user)
        .set({ 
          biography,
          updatedAt: new Date() 
        })
        .where(eq(user.id, session.user.id));
      
      return { success: true };
    } catch (error) {
      console.error("Error updating user biography:", error);
      context.set.status = 500;
      return { error: String(error) };
    }
  }, {
    body: t.Object({
      biography: t.String(),
    }),
  });
