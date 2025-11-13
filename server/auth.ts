import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { admins, type Admin } from '../drizzle/schema';
import { getDb } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a JWT token for an admin
 */
export function createAdminToken(admin: Admin): string {
  return jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
}

/**
 * Verify and decode a JWT token
 */
export function verifyAdminToken(token: string): { id: number; email: string; name: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; name: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Get admin by email
 */
export async function getAdminByEmail(email: string): Promise<Admin | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn('[Auth] Cannot get admin: database not available');
    return undefined;
  }

  const result = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get admin by ID
 */
export async function getAdminById(id: number): Promise<Admin | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn('[Auth] Cannot get admin: database not available');
    return undefined;
  }

  const result = await db.select().from(admins).where(eq(admins.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Create a new admin account
 */
export async function createAdmin(email: string, password: string, name: string): Promise<Admin> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const passwordHash = await hashPassword(password);
  
  const result = await db.insert(admins).values({
    email,
    passwordHash,
    name,
    isActive: true,
  });

  const adminId = Number(result[0].insertId);
  const admin = await getAdminById(adminId);
  
  if (!admin) {
    throw new Error('Failed to create admin');
  }

  return admin;
}

/**
 * Update admin's last signed in timestamp
 */
export async function updateAdminLastSignedIn(adminId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn('[Auth] Cannot update admin: database not available');
    return;
  }

  await db.update(admins)
    .set({ lastSignedIn: new Date() })
    .where(eq(admins.id, adminId));
}
