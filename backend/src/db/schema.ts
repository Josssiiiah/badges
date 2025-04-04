import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { nanoid } from "nanoid";

// Organizations table
export const organizations = sqliteTable("organizations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  short_code: text("short_code").unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$type<Date>(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$type<Date>(),
});

// Organization Users junction table
export const organizationUsers = sqliteTable("organization_users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  organizationId: text("organization_id")
    .references(() => organizations.id)
    .notNull(),
  userId: text("user_id")
    .references(() => user.id)
    .notNull(),
  role: text("role", { enum: ["student", "administrator"] })
    .default("student")
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$type<Date>(),
});

// Create Badges table (previously badges)
export const createdBadges = sqliteTable("created_badges", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  issuedBy: text("issued_by").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  imageData: text("image_data"),
  courseLink: text("course_link"),
  skills: text("skills"),
  earningCriteria: text("earning_criteria"),
  organizationId: text("organization_id").references(() => organizations.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$type<Date>(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$type<Date>(),
});

// Assigned Badges table
export const badges = sqliteTable("badges", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  badgeId: text("badge_id")
    .references(() => createdBadges.id)
    .notNull(),
  userId: text("user_id")
    .references(() => user.id)
    .notNull(),
  earnedAt: integer("earned_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$type<Date>(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$type<Date>(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .$type<Date>(),
});

// Students table
export const students = sqliteTable("students", {
  studentId: text("student_id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  hasBadge: integer("has_badge", { mode: "boolean" })
    .default(false)
    .$type<boolean>(),
  badgeId: text("badge_id").references(() => badges.id),
  organizationId: text("organization_id").references(() => organizations.id),
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
  role: text("role", { enum: ["student", "administrator"] })
    .default("student")
    .notNull(),
  organization: text("organization"),
  organizationId: text("organization_id").references(() => organizations.id),
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