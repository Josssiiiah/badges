import { Elysia } from "elysia";
import betterAuthView from "../auth/auth-view";
import { auth as authInstance } from "../auth";

// Export a debug endpoint for get-session to check if the session is present
export const auth = new Elysia({ prefix: "/auth" })
  .get("/get-session", async (context) => {
    console.log("Custom get-session endpoint called");
    
    try {
      // Forward to the better-auth handler
      const response = await authInstance.handler(context.request);
      console.log("Custom get-session response:", response.status);
      return response;
    } catch (error) {
      console.error("Custom get-session error:", error);
      return {
        error: "Failed to get session",
        message: error instanceof Error ? error.message : String(error),
      };
    }
  })
  .all("/*", betterAuthView);
