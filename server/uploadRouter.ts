import { router, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";

// Helper to generate random suffix for file keys
function randomSuffix(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const uploadRouter = router({
  // Upload floor plan image
  uploadFloorPlan: adminProcedure
    .input(z.object({
      eventId: z.number(),
      fileName: z.string(),
      fileData: z.string(), // base64 encoded
      mimeType: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Import getDb and events from schema
      const { getDb } = await import('./db');
      const { events } = await import('../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      
      // Check if event is published
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database not available',
        });
      }
      
      const event = await db.select().from(events).where(eq(events.id, input.eventId)).limit(1);
      if (event.length > 0 && event[0].status === 'published') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Não é possível modificar planta de evento publicado. Mude o status para "Rascunho" primeiro.',
        });
      }
      
      try {
        // Decode base64
        const buffer = Buffer.from(input.fileData, 'base64');
        
        // Generate unique key
        const extension = input.fileName.split('.').pop() || 'png';
        const fileKey = `events/${input.eventId}/floor-plan-${randomSuffix()}.${extension}`;
        
        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        return {
          success: true,
          url,
          key: fileKey,
        };
      } catch (error) {
        console.error('Upload error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to upload image',
        });
      }
    }),

  // Upload exhibitor logo
  uploadExhibitorLogo: adminProcedure
    .input(z.object({
      eventId: z.number(),
      exhibitorId: z.number().optional(),
      fileName: z.string(),
      fileData: z.string(), // base64 encoded
      mimeType: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Decode base64
        const buffer = Buffer.from(input.fileData, 'base64');
        
        // Generate unique key
        const extension = input.fileName.split('.').pop() || 'png';
        const fileKey = `events/${input.eventId}/exhibitors/logo-${randomSuffix()}.${extension}`;
        
        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        return {
          success: true,
          url,
          key: fileKey,
        };
      } catch (error) {
        console.error('Upload error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to upload logo',
        });
      }
    }),

  // Upload sponsor logo
  uploadSponsorLogo: adminProcedure
    .input(z.object({
      fileName: z.string(),
      fileData: z.string(), // base64 encoded
      mimeType: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Decode base64
        const buffer = Buffer.from(input.fileData, 'base64');
        
        // Generate unique key
        const extension = input.fileName.split('.').pop() || 'png';
        const fileKey = `sponsors/logo-${randomSuffix()}.${extension}`;
        
        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        return {
          success: true,
          url,
          key: fileKey,
        };
      } catch (error) {
        console.error('Upload error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to upload logo',
        });
      }
    }),
});
