import { z } from 'zod';

export const reserveSchema = z.object({
  body: z.object({
    slotId: z.string().uuid(),
    devoteeName: z.string().min(2),
    devoteePhone: z.string().min(7).max(15).optional(),
    devoteeEmail: z.string().email().optional(),
    seats: z.number().int().positive().max(20).default(1),
    idempotencyKey: z.string().min(8).optional(),
  }),
});

export const confirmSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    gatewayPaymentId: z.string().optional(),
    gatewaySignature: z.string().optional(),
  }),
});

export const spotBookingSchema = z.object({
  body: z.object({
    slotId: z.string().uuid(),
    devoteeName: z.string().min(2),
    devoteePhone: z.string().min(7).max(15).optional(),
    seats: z.number().int().positive().max(20).default(1),
  }),
});

export const scanSchema = z.object({
  body: z.object({ qrToken: z.string().min(8) }),
});
