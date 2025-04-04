import { Elysia, t } from "elysia";
import { db } from "../db/connection";
import { user } from "../db/schema";
import { eq } from "drizzle-orm";
import { setup } from "../setup";
import { userMiddleware } from "../middleware/auth-middleware";

export const userRoutes = new Elysia({ prefix: "/users" })
  .use(setup)
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
  });
