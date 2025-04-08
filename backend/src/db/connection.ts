import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { Database } from "bun:sqlite";
import * as schema from "./schema";
import { resolve } from "path";

// Initialize SQLite database with Bun's built-in SQLite
const sqlite = new Database("sqlite.db");

// Create Drizzle client
export const db = drizzle(sqlite, { schema });

/**
 * Apply all pending database migrations
 * Call this function during application startup
 */
export async function migrateDatabase() {
  try {
    console.log("Running database migrations...");
    // Resolve the path to the migrations directory
    const migrationsFolder = resolve("./drizzle");
    
    // Apply all pending migrations
    await migrate(db, { migrationsFolder });
    
    console.log("Database migrations completed successfully");
  } catch (error) {
    console.error("Error applying database migrations:", error);
    throw error;
  }
}
