import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const siteProfile = mysqlTable("site_profile", {
  id: int("id").primaryKey().default(1),
  name: varchar("name", { length: 160 }).notNull().default("Khairy Eid Aly"),
  roleEn: varchar("roleEn", { length: 240 }).notNull().default("Developer • Creator • Digital Projects"),
  roleAr: varchar("roleAr", { length: 240 }).notNull().default("مطور • صانع محتوى • مشاريع رقمية"),
  bioEn: text("bioEn").notNull(),
  bioAr: text("bioAr").notNull(),
  locationEn: varchar("locationEn", { length: 160 }).notNull(),
  locationAr: varchar("locationAr", { length: 160 }).notNull(),
  portraitKey: text("portraitKey"),
  coverKey: text("coverKey"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  titleEn: varchar("titleEn", { length: 160 }).notNull(),
  titleAr: varchar("titleAr", { length: 160 }).notNull(),
  descriptionEn: text("descriptionEn").notNull(),
  descriptionAr: text("descriptionAr").notNull(),
  articleBodyEn: text("articleBodyEn").notNull().default(""),
  articleBodyAr: text("articleBodyAr").notNull().default(""),
  typeEn: varchar("typeEn", { length: 120 }).notNull(),
  typeAr: varchar("typeAr", { length: 120 }).notNull(),
  category: varchar("category", { length: 32 }).notNull().default("applications"),
  href: text("href").notNull(),
  imageKey: text("imageKey"),
  sortOrder: int("sortOrder").notNull().default(0),
  isPublished: boolean("isPublished").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const socialLinks = mysqlTable("social_links", {
  id: int("id").autoincrement().primaryKey(),
  platform: varchar("platform", { length: 40 }).notNull().unique(),
  platformEn: varchar("platformEn", { length: 80 }).notNull().default(""),
  platformAr: varchar("platformAr", { length: 80 }).notNull().default(""),
  handleEn: varchar("handleEn", { length: 160 }).notNull(),
  handleAr: varchar("handleAr", { length: 160 }).notNull(),
  href: text("href").notNull(),
  sortOrder: int("sortOrder").notNull().default(0),
  isPublished: boolean("isPublished").notNull().default(true),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const siteSettings = mysqlTable("site_settings", {
  id: int("id").primaryKey().default(1),
  autoGithubSync: boolean("autoGithubSync").notNull().default(false),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteProfile = typeof siteProfile.$inferSelect;
export type InsertSiteProfile = typeof siteProfile.$inferInsert;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type SocialLink = typeof socialLinks.$inferSelect;
export type InsertSocialLink = typeof socialLinks.$inferInsert;