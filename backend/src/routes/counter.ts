import { Elysia } from "elysia";
import betterAuthView from "../auth/auth-view";
import { userMiddleware } from "../middleware/auth-middleware";
import { setup } from "../setup";
import { db } from "../db/connection";
import { counters } from "../db/schema";
import { eq } from "drizzle-orm";

export const counterRoutes = new Elysia({ prefix: "/counter" })
  .use(setup)
  // .derive(userMiddleware)
  .get("/count", async () => {
    console.log("GET /api/counter endpoint called");

    try {
      const result = await db
        .select()
        .from(counters)
        .where(eq(counters.id, "main"));

      console.log("Query result:", result);

      const counter = result[0]; // Use array index instead of .get()
      console.log("Counter value:", counter?.count || 0);

      return { count: counter?.count || 0 };
    } catch (error) {
      console.error("Error fetching counter:", error);
      return { count: 0, error: String(error) };
    }
  })
  .post("/increment", async () => {
    console.log("POST /api/counter/increment endpoint called");

    try {
      // Check if the counter exists
      const result = await db
        .select()
        .from(counters)
        .where(eq(counters.id, "main"));

      console.log("Query result:", result);

      const counter = result[0]; // Use array index instead of .get()

      if (!counter) {
        console.log("Counter not found, creating new counter");
        // Create the counter if it doesn't exist
        await db.insert(counters).values({ id: "main", count: 1 });
        return { count: 1 };
      } else {
        // Update the counter
        const newCount = counter.count + 1;
        console.log("Updating counter to:", newCount);

        await db
          .update(counters)
          .set({ count: newCount })
          .where(eq(counters.id, "main"));

        return { count: newCount };
      }
    } catch (error) {
      console.error("Error incrementing counter:", error);
      return { count: 0, error: String(error) };
    }
  });
