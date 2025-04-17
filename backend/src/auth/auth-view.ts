import { auth } from "./index";
import { Context } from "elysia";

const betterAuthView = async (context: Context) => {
  const BETTER_AUTH_ACCEPT_METHODS = ["POST", "GET"];

  // Add detailed logging for debugging
  console.log("Auth request received:", {
    url: context.request.url,
    method: context.request.method,
    path: new URL(context.request.url).pathname
  });
  
  // Log cookies if they exist
  const cookieHeader = context.request.headers.get('cookie');
  console.log("Cookie header:", cookieHeader || "No cookies");

  try {
    if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
      console.log("Processing auth request for path:", new URL(context.request.url).pathname);
      const response = await auth.handler(context.request);
      console.log("Auth response status:", response.status);
      
      // Log response headers for debugging
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      console.log("Auth response headers:", responseHeaders);
      
      return response;
    } else {
      console.error("Method not allowed:", context.request.method);
      context.error(405);
    }
  } catch (error) {
    console.error("Auth handler error:", error);
    context.error(500, {
      message: "Internal server error in auth handler",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export default betterAuthView;
