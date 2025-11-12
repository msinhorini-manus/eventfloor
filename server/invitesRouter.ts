import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { 
  createInvite, 
  getInvitesByCreator, 
  validateInviteToken, 
  markInviteAsUsed,
  revokeInvite,
  resendInvite,
  getInviteByToken
} from "./invites";
import { TRPCError } from "@trpc/server";

export const invitesRouter = router({
  /**
   * Create a new invite (admin only)
   */
  create: protectedProcedure
    .input(z.object({
      email: z.string().email().optional(),
      role: z.enum(["user", "admin"]),
      expiresInDays: z.number().min(1).max(30).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Only admins can create invites
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem criar convites",
        });
      }

      const invite = await createInvite({
        email: input.email,
        role: input.role,
        createdBy: ctx.user.id,
        expiresInDays: input.expiresInDays || 7,
      });

      return invite;
    }),

  /**
   * List all invites created by current user (admin only)
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Apenas administradores podem listar convites",
      });
    }

    return await getInvitesByCreator(ctx.user.id);
  }),

  /**
   * Get invite details by token (public)
   */
  getByToken: publicProcedure
    .input(z.object({
      token: z.string(),
    }))
    .query(async ({ input }) => {
      const invite = await getInviteByToken(input.token);
      
      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Convite não encontrado",
        });
      }

      // Return only safe fields
      return {
        id: invite.id,
        role: invite.role,
        email: invite.email,
        expiresAt: invite.expiresAt,
        status: invite.status,
      };
    }),

  /**
   * Validate invite token (public)
   */
  validate: publicProcedure
    .input(z.object({
      token: z.string(),
      userEmail: z.string().email().optional(),
    }))
    .query(async ({ input }) => {
      return await validateInviteToken(input.token, input.userEmail);
    }),

  /**
   * Accept invite and mark as used (requires authentication)
   */
  accept: protectedProcedure
    .input(z.object({
      token: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const validation = await validateInviteToken(input.token, ctx.user.email || undefined);

      if (!validation.valid || !validation.invite) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: validation.error || "Convite inválido",
        });
      }

      // Mark invite as used
      await markInviteAsUsed(validation.invite.id, ctx.user.id);

      return {
        success: true,
        role: validation.invite.role,
      };
    }),

  /**
   * Revoke an invite (admin only)
   */
  revoke: protectedProcedure
    .input(z.object({
      inviteId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem revogar convites",
        });
      }

      await revokeInvite(input.inviteId);

      return { success: true };
    }),

  /**
   * Resend an invite (creates new token, admin only)
   */
  resend: protectedProcedure
    .input(z.object({
      inviteId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem reenviar convites",
        });
      }

      const newInvite = await resendInvite(input.inviteId);

      return newInvite;
    }),
});
