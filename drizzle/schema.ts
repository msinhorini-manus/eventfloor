import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, float, boolean } from "drizzle-orm/mysql-core";

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

/**
 * Events table - stores information about Portal ERP events
 */
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  dateStart: timestamp("dateStart").notNull(),
  dateEnd: timestamp("dateEnd"),
  location: varchar("location", { length: 255 }),
  description: text("description"),
  floorPlanImageUrl: text("floorPlanImageUrl"),
  floorPlanImageKey: varchar("floorPlanImageKey", { length: 255 }),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Exhibitors table - stores information about exhibitors at events
 */
export const exhibitors = mysqlTable("exhibitors", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  logoUrl: text("logoUrl"),
  logoKey: varchar("logoKey", { length: 255 }),
  description: text("description"),
  website: varchar("website", { length: 255 }),
  category: varchar("category", { length: 100 }),
  boothNumber: varchar("boothNumber", { length: 50 }),
  /** Position X on floor plan (percentage 0-100) */
  positionX: float("positionX"),
  /** Position Y on floor plan (percentage 0-100) */
  positionY: float("positionY"),
  /** Whether this exhibitor is featured/highlighted */
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Exhibitor = typeof exhibitors.$inferSelect;
export type InsertExhibitor = typeof exhibitors.$inferInsert;

/**
 * Sponsors table - stores information about event sponsors
 */
export const sponsors = mysqlTable("sponsors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  logoUrl: text("logoUrl"),
  logoKey: varchar("logoKey", { length: 255 }),
  website: varchar("website", { length: 500 }),
  description: text("description"),
  /** Sponsor tier: diamond, gold, silver, bronze */
  tier: mysqlEnum("tier", ["diamond", "gold", "silver", "bronze"]).notNull(),
  /** Display order (lower numbers appear first) */
  displayOrder: int("displayOrder").default(0).notNull(),
  /** Whether this sponsor is active and should be displayed */
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Sponsor = typeof sponsors.$inferSelect;
export type InsertSponsor = typeof sponsors.$inferInsert;

/**
 * Event Sponsors table - links sponsors to specific events
 * Allows same sponsor to appear in multiple events with different tiers
 */
export const eventSponsors = mysqlTable("event_sponsors", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  sponsorId: int("sponsorId").notNull(),
  /** Sponsor tier for this specific event: diamond, gold, silver, bronze */
  tier: mysqlEnum("tier", ["diamond", "gold", "silver", "bronze"]).notNull(),
  /** Display order within this event (lower numbers appear first) */
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EventSponsor = typeof eventSponsors.$inferSelect;
export type InsertEventSponsor = typeof eventSponsors.$inferInsert;
