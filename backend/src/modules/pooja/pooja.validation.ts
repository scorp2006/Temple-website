import { z } from 'zod';

export const createPoojaSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    imageUrl: z.string().url().optional(),
    basePrice: z.number().int().nonnegative(),
    isSpecial: z.boolean().optional(),
  }),
});

export const updatePoojaSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    imageUrl: z.string().url().optional(),
    basePrice: z.number().int().nonnegative().optional(),
    isSpecial: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createSlotSchema = z.object({
  body: z.object({
    poojaId: z.string().uuid(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    capacity: z.number().int().positive(),
    price: z.number().int().nonnegative().optional(),
  }),
});

export const bulkSlotSchema = z.object({
  body: z.object({
    poojaId: z.string().uuid(),
    startDate: z.string(), // yyyy-mm-dd
    endDate: z.string(),
    dailyStartTime: z.string().regex(/^\d{2}:\d{2}$/),
    dailyEndTime: z.string().regex(/^\d{2}:\d{2}$/),
    slotDurationMinutes: z.number().int().positive(),
    capacity: z.number().int().positive(),
    price: z.number().int().nonnegative().optional(),
  }),
});

export const updateSlotSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    capacity: z.number().int().positive().optional(),
    price: z.number().int().nonnegative().optional(),
    isOpen: z.boolean().optional(),
  }),
});
