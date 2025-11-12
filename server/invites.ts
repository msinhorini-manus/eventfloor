import { eq, and } from "drizzle-orm";
import { invites } from "../drizzle/schema";
import { getDb } from "./db";
import crypto from "crypto";

/**
 * Generate a secure random token for invites
 * @returns 32-character random string
 */
export function generateInviteToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Create a new invite
 */
export async function createInvite(data: {
  email?: string;
  role: "user" | "admin";
  createdBy: number;
  expiresInDays?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const token = generateInviteToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (data.expiresInDays || 7));

  await db.insert(invites).values({
    token,
    email: data.email || null,
    role: data.role,
    createdBy: data.createdBy,
    expiresAt,
    status: "pending",
  });

  // Get the created invite
  const [invite] = await db.select().from(invites)
    .where(eq(invites.token, token))
    .limit(1);

  return invite;
}

/**
 * Get all invites created by a user
 */
export async function getInvitesByCreator(createdBy: number) {
  const db = await getDb();
  if (!db) return [];

  // Update expired invites
  await db.update(invites)
    .set({ status: "expired" })
    .where(
      and(
        eq(invites.status, "pending"),
        // @ts-ignore - timestamp comparison
        invites.expiresAt < new Date()
      )
    );

  return await db.select().from(invites)
    .where(eq(invites.createdBy, createdBy))
    .orderBy(invites.createdAt);
}

/**
 * Get invite by token
 */
export async function getInviteByToken(token: string) {
  const db = await getDb();
  if (!db) return null;

  const [invite] = await db.select().from(invites)
    .where(eq(invites.token, token))
    .limit(1);

  return invite || null;
}

/**
 * Validate invite token
 * @returns { valid: boolean, error?: string, invite?: Invite }
 */
export async function validateInviteToken(token: string, userEmail?: string) {
  const invite = await getInviteByToken(token);

  if (!invite) {
    return { valid: false, error: "Convite não encontrado" };
  }

  if (invite.status === "used") {
    return { valid: false, error: "Este convite já foi utilizado" };
  }

  if (invite.status === "revoked") {
    return { valid: false, error: "Este convite foi revogado" };
  }

  if (invite.status === "expired" || new Date() > new Date(invite.expiresAt)) {
    // Mark as expired if not already
    if (invite.status !== "expired") {
      const db = await getDb();
      if (db) {
        await db.update(invites)
          .set({ status: "expired" })
          .where(eq(invites.id, invite.id));
      }
    }
    return { valid: false, error: "Este convite expirou" };
  }

  // If invite has email specified, validate it matches
  if (invite.email && userEmail && invite.email.toLowerCase() !== userEmail.toLowerCase()) {
    return { 
      valid: false, 
      error: `Este convite foi enviado para ${invite.email}. Você está logado com ${userEmail}.` 
    };
  }

  return { valid: true, invite };
}

/**
 * Mark invite as used
 */
export async function markInviteAsUsed(inviteId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(invites)
    .set({
      status: "used",
      usedAt: new Date(),
      usedBy: userId,
    })
    .where(eq(invites.id, inviteId));
}

/**
 * Revoke an invite
 */
export async function revokeInvite(inviteId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(invites)
    .set({ status: "revoked" })
    .where(eq(invites.id, inviteId));
}

/**
 * Resend invite (create new token with same data)
 */
export async function resendInvite(inviteId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [oldInvite] = await db.select().from(invites)
    .where(eq(invites.id, inviteId))
    .limit(1);

  if (!oldInvite) {
    throw new Error("Invite not found");
  }

  // Mark old invite as expired
  await db.update(invites)
    .set({ status: "expired" })
    .where(eq(invites.id, inviteId));

  // Create new invite
  return await createInvite({
    email: oldInvite.email || undefined,
    role: oldInvite.role,
    createdBy: oldInvite.createdBy,
    expiresInDays: 7,
  });
}
