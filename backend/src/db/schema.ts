import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { nanoid } from "nanoid";

// Students table
export const students = sqliteTable("students", {
  studentId: text("student_id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  hasBadge: integer("has_badge", { mode: "boolean" })
    .default(false)
    .$type<boolean>(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$type<Date>(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$type<Date>(),
});

// BetterAuth Tables
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .$type<boolean>(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$type<Date>(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$type<Date>(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id),
  token: text("token"),
  expiresAt: integer("expires_at", { mode: "timestamp" }).$type<Date>(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$type<Date>(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$type<Date>(),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id),
  accountId: text("account_id"),
  providerId: text("provider_id"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }).$type<Date>(),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }).$type<Date>(),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$type<Date>(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$type<Date>(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier"),
  value: text("value"),
  expiresAt: integer("expires_at", { mode: "timestamp" }).$type<Date>(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$type<Date>(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$type<Date>(),
});
