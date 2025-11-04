import { eq, desc, and, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, events, exhibitors, InsertEvent, InsertExhibitor } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Events Functions ============

export async function getAllEvents() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(events).orderBy(desc(events.createdAt));
}

export async function getEventById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getEventBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(events).where(eq(events.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPublishedEvents() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(events)
    .where(eq(events.status, "published"))
    .orderBy(desc(events.dateStart));
}

export async function createEvent(event: InsertEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(events).values(event);
  return result;
}

export async function updateEvent(id: number, event: Partial<InsertEvent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(events).set(event).where(eq(events.id, id));
}

export async function deleteEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete all exhibitors first
  await db.delete(exhibitors).where(eq(exhibitors.eventId, id));
  // Then delete the event
  await db.delete(events).where(eq(events.id, id));
}

// ============ Exhibitors Functions ============

export async function getExhibitorsByEventId(eventId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(exhibitors)
    .where(eq(exhibitors.eventId, eventId))
    .orderBy(exhibitors.name);
}

export async function getExhibitorById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(exhibitors).where(eq(exhibitors.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function searchExhibitors(eventId: number, searchTerm: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(exhibitors)
    .where(
      and(
        eq(exhibitors.eventId, eventId),
        or(
          like(exhibitors.name, `%${searchTerm}%`),
          like(exhibitors.category, `%${searchTerm}%`),
          like(exhibitors.boothNumber, `%${searchTerm}%`)
        )
      )
    )
    .orderBy(exhibitors.name);
}

export async function createExhibitor(exhibitor: InsertExhibitor) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(exhibitors).values(exhibitor);
  return result;
}

export async function updateExhibitor(id: number, exhibitor: Partial<InsertExhibitor>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(exhibitors).set(exhibitor).where(eq(exhibitors.id, id));
}

export async function deleteExhibitor(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(exhibitors).where(eq(exhibitors.id, id));
}
