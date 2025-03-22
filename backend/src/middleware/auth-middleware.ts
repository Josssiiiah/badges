import { auth } from "../auth";
import { Context } from "elysia";
import { Session, User } from "better-auth/types";

export const userMiddleware = async (c: Context) => {
  const session = await auth.api.getSession({ headers: c.request.headers });

  if (!session) {
    c.set.status = 401;
    return {
      success: "error",
      message: "Unauthorized Access: Token is missing",
    };
  }

  if (!session.user) {
    c.set.status = 401;
    return {
      success: "error",
      message: "Unauthorized Access: User is missing",
    };
  }

  return {
    user: session.user,
    session: session.session,
  };
};

export const userInfo = (user: User | null, session: Session | null) => {
  return {
    user: user,
    session: session,
  };
};
