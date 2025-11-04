import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { uploadRouter } from "./uploadRouter";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  upload: uploadRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Events router
  events: router({
    // Public: get published events
    listPublished: publicProcedure.query(async () => {
      return await db.getPublishedEvents();
    }),

    // Public: get event by slug
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const event = await db.getEventBySlug(input.slug);
        if (!event) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' });
        }
        if (event.status !== 'published') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Event not published' });
        }
        return event;
      }),

    // Admin: list all events
    listAll: adminProcedure.query(async () => {
      return await db.getAllEvents();
    }),

    // Admin: get event by id
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const event = await db.getEventById(input.id);
        if (!event) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' });
        }
        return event;
      }),

    // Admin: create event
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        dateStart: z.date(),
        dateEnd: z.date().optional(),
        location: z.string().optional(),
        description: z.string().optional(),
        floorPlanImageUrl: z.string().optional(),
        floorPlanImageKey: z.string().optional(),
        status: z.enum(["draft", "published", "archived"]).default("draft"),
      }))
      .mutation(async ({ input, ctx }) => {
        // Check if slug already exists
        const existing = await db.getEventBySlug(input.slug);
        if (existing) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Event slug already exists' });
        }

        await db.createEvent({
          ...input,
          createdBy: ctx.user.id,
        });
        return { success: true };
      }),

    // Admin: update event
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        dateStart: z.date().optional(),
        dateEnd: z.date().optional(),
        location: z.string().optional(),
        description: z.string().optional(),
        floorPlanImageUrl: z.string().optional(),
        floorPlanImageKey: z.string().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        
        // Check if event exists
        const event = await db.getEventById(id);
        if (!event) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' });
        }

        // If slug is being updated, check for conflicts
        if (data.slug && data.slug !== event.slug) {
          const existing = await db.getEventBySlug(data.slug);
          if (existing) {
            throw new TRPCError({ code: 'CONFLICT', message: 'Event slug already exists' });
          }
        }

        await db.updateEvent(id, data);
        return { success: true };
      }),

    // Admin: delete event
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteEvent(input.id);
        return { success: true };
      }),
  }),

  // Exhibitors router
  exhibitors: router({
    // Public: list exhibitors by event slug
    listByEventSlug: publicProcedure
      .input(z.object({ eventSlug: z.string() }))
      .query(async ({ input }) => {
        const event = await db.getEventBySlug(input.eventSlug);
        if (!event || event.status !== 'published') {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' });
        }
        return await db.getExhibitorsByEventId(event.id);
      }),

    // Public: search exhibitors
    search: publicProcedure
      .input(z.object({
        eventSlug: z.string(),
        searchTerm: z.string(),
      }))
      .query(async ({ input }) => {
        const event = await db.getEventBySlug(input.eventSlug);
        if (!event || event.status !== 'published') {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' });
        }
        return await db.searchExhibitors(event.id, input.searchTerm);
      }),

    // Admin: list exhibitors by event id
    listByEventId: adminProcedure
      .input(z.object({ eventId: z.number() }))
      .query(async ({ input }) => {
        return await db.getExhibitorsByEventId(input.eventId);
      }),

    // Admin: get exhibitor by id
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const exhibitor = await db.getExhibitorById(input.id);
        if (!exhibitor) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Exhibitor not found' });
        }
        return exhibitor;
      }),

    // Admin: create exhibitor
    create: adminProcedure
      .input(z.object({
        eventId: z.number(),
        name: z.string().min(1),
        slug: z.string().min(1),
        logoUrl: z.string().optional(),
        logoKey: z.string().optional(),
        description: z.string().optional(),
        website: z.string().optional(),
        category: z.string().optional(),
        boothNumber: z.string().optional(),
        positionX: z.number().optional(),
        positionY: z.number().optional(),
        featured: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        await db.createExhibitor(input);
        return { success: true };
      }),

    // Admin: update exhibitor
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        logoUrl: z.string().optional(),
        logoKey: z.string().optional(),
        description: z.string().optional(),
        website: z.string().optional(),
        category: z.string().optional(),
        boothNumber: z.string().optional(),
        positionX: z.number().optional(),
        positionY: z.number().optional(),
        featured: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        
        // Check if exhibitor exists
        const exhibitor = await db.getExhibitorById(id);
        if (!exhibitor) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Exhibitor not found' });
        }

        await db.updateExhibitor(id, data);
        return { success: true };
      }),

    // Admin: delete exhibitor
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteExhibitor(input.id);
        return { success: true };
      }),
  }),

  // Sponsors router
  sponsors: router({    // Public: list active sponsors
    listActive: publicProcedure.query(async () => {
      return await db.listActiveSponsors();
    }),

    // Admin: list all sponsors
    listAll: adminProcedure.query(async () => {
      return await db.listSponsors();
    }),

    // Admin: get sponsor by id
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const sponsor = await db.getSponsorById(input.id);
        if (!sponsor) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Sponsor not found' });
        }
        return sponsor;
      }),

    // Admin: create sponsor
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        logoUrl: z.string().optional(),
        logoKey: z.string().optional(),
        website: z.string().optional(),
        description: z.string().optional(),
        tier: z.enum(["diamond", "gold", "silver", "bronze"]),
        displayOrder: z.number().default(0),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        await db.createSponsor(input);
        return { success: true };
      }),

    // Admin: update sponsor
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        logoUrl: z.string().optional(),
        logoKey: z.string().optional(),
        website: z.string().optional(),
        description: z.string().optional(),
        tier: z.enum(["diamond", "gold", "silver", "bronze"]).optional(),
        displayOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        
        // Check if sponsor exists
        const sponsor = await db.getSponsorById(id);
        if (!sponsor) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Sponsor not found' });
        }

        await db.updateSponsor(id, data);
        return { success: true };
      }),

    // Admin: delete sponsor
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSponsor(input.id);
        return { success: true };
      }),
  }),

  // Event Sponsors router
  eventSponsors: router({
    // Public: list sponsors by event slug
    listByEventSlug: publicProcedure
      .input(z.object({ eventSlug: z.string() }))
      .query(async ({ input }) => {
        const event = await db.getEventBySlug(input.eventSlug);
        if (!event || event.status !== 'published') {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' });
        }
        return await db.listEventSponsors(event.id);
      }),

    // Admin: list sponsors by event id
    listByEventId: adminProcedure
      .input(z.object({ eventId: z.number() }))
      .query(async ({ input }) => {
        return await db.listEventSponsors(input.eventId);
      }),

    // Admin: add sponsor to event
    addToEvent: adminProcedure
      .input(z.object({
        eventId: z.number(),
        sponsorId: z.number(),
        tier: z.enum(["diamond", "gold", "silver", "bronze"]),
        displayOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        await db.addSponsorToEvent(input);
        return { success: true };
      }),

    // Admin: update event sponsor
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        tier: z.enum(["diamond", "gold", "silver", "bronze"]).optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        
        // Check if event sponsor exists
        const eventSponsor = await db.getEventSponsorById(id);
        if (!eventSponsor) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Event sponsor not found' });
        }

        await db.updateEventSponsor(id, data);
        return { success: true };
      }),

    // Admin: remove sponsor from event
    removeFromEvent: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.removeSponsorFromEvent(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
