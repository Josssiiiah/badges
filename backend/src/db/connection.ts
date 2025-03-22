import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./schema";

// Initialize SQLite database with Bun's built-in SQLite
const sqlite = new Database("sqlite.db");

// Create Drizzle client
export const db = drizzle(sqlite, { schema });

