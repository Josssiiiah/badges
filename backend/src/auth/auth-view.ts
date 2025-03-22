import { auth } from "./index";
import { Context } from "elysia";

const betterAuthView = async (context: Context) => {
  const BETTER_AUTH_ACCEPT_METHODS = ["POST", "GET"];

  try {
    if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
      const response = await auth.handler(context.request);
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
