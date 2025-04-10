import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { Database } from "bun:sqlite";
import * as schema from "./schema";
import { resolve } from "path";


import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncInterval: 60,
  concurrency: 10,

});

export const db = drizzle(turso);