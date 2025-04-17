import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
// import { createGroq } from "@ai-sdk/groq";

const frontendUrl = process.env.FRONTEND_URL;

if (!frontendUrl) throw new Error("FRONTEND_URL is not set");

export const setup = new Elysia().use(
  cors({
    origin: [frontendUrl, "http://localhost:3001"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie'],
  }),
  // ).decorate("groq", createGroq({
  //   apiKey: process.env.GROQ_API_KEY,
  // }));
);
