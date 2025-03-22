import { db } from "../db/connection";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { account, session, user, verification } from "../db/schema";

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
  cookie: {
    secure: true,
  },
  emailAndPassword: {
    enabled: true, // If you want to use email and password auth
    autoSignIn: false, // Disable automatic sign in after signup
  },
  // socialProviders: {
  //   /*
  //    * We're using Google as our social provider,
  //    * make sure you have set your environment variables
  //    */
  //   // google: {
  //   //   clientId: process.env.GOOGLE_CLIENT_ID!,
  //   //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  //   // },
  // },
  trustedOrigins: [
    "http://localhost:3001", // Frontend origin
    "http://localhost:3000", // Backend origin
    "https://badges-production.up.railway.app",
  ],
});
