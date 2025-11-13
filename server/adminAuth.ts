import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, router } from './_core/trpc';
import { 
  getAdminByEmail, 
  verifyPassword, 
  createAdminToken, 
  verifyAdminToken,
  getAdminById,
  updateAdminLastSignedIn
} from './auth';

const ADMIN_COOKIE_NAME = 'admin_session';
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export const adminAuthRouter = router({
  /**
   * Login with email and password
   */
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }))
    .mutation(async ({ input, ctx }) => {
      const admin = await getAdminByEmail(input.email);

      if (!admin) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      if (!admin.isActive) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Account is disabled',
        });
      }

      const isValidPassword = await verifyPassword(input.password, admin.passwordHash);

      if (!isValidPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Update last signed in timestamp
      await updateAdminLastSignedIn(admin.id);

      // Create JWT token
      const token = createAdminToken(admin);

      // Set cookie
      ctx.res.cookie(ADMIN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: ONE_YEAR_MS,
        path: '/',
      });

      return {
        success: true,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        },
      };
    }),

  /**
   * Get current admin from cookie
   */
  me: publicProcedure.query(async ({ ctx }) => {
    const token = ctx.req.cookies[ADMIN_COOKIE_NAME];

    if (!token) {
      return null;
    }

    const decoded = verifyAdminToken(token);

    if (!decoded) {
      return null;
    }

    const admin = await getAdminById(decoded.id);

    if (!admin || !admin.isActive) {
      return null;
    }

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    };
  }),

  /**
   * Logout (clear cookie)
   */
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie(ADMIN_COOKIE_NAME, { path: '/' });
    return { success: true };
  }),
});
