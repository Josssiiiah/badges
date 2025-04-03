import { auth } from "../auth";
import { Context } from "elysia";
import { Session, User } from "better-auth/types";

export const userMiddleware = async (c: Context) => {
  try {
    console.log("Auth middleware: Checking session");
    const session = await auth.api.getSession({ headers: c.request.headers });
    console.log("Auth middleware: Session result:", session ? "Session found" : "No session");

    if (!session) {
      console.log("Auth middleware: No session found");
      c.set.status = 401;
      return {
        user: null,
        session: null,
        success: "error",
        message: "Unauthorized Access: Token is missing",
      };
    }

    if (!session.user) {
      console.log("Auth middleware: Session found but no user");
      c.set.status = 401;
      return {
        user: null,
        session: session.session,
        success: "error",
        message: "Unauthorized Access: User is missing",
      };
    }

    console.log("Auth middleware: Valid user found:", 
      { id: session.user.id, email: session.user.email || "N/A" });
    
    return {
      user: session.user,
      session: session.session,
    };
  } catch (error) {
    console.error("Auth middleware error:", error);
    c.set.status = 500;
    return {
      user: null,
      session: null,
      success: "error",
      message: "Auth middleware error: " + (error instanceof Error ? error.message : String(error)),
    };
  }
};

export const userInfo = (user: User | null, session: Session | null) => {
  return {
    user: user,
    session: session,
  };
};
