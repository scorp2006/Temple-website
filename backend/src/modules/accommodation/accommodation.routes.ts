import { Router } from 'express';
import { z } from 'zod';
import { accommodationService } from './accommodation.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole, optionalAuth } from '../../middleware/auth';
import { sensitiveLimiter } from '../../middleware/rateLimiter';

const router = Router();

const createRoomTypeSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    imageUrl: z.string().url().optional(),
    pricePerNight: z.number().int().nonnegative(),
    capacity: z.number().int().positive(),
  }),
});

const addRoomSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ number: z.string().min(1) }),
});

const reserveSchema = z.object({
  body: z.object({
    roomTypeId: z.string().uuid(),
    checkIn: z.string(),
    checkOut: z.string(),
    guestName: z.string().min(2),
    guestPhone: z.string().min(7).max(15).optional(),
    guestEmail: z.string().email().optional(),
    guests: z.number().int().positive().optional(),
    idempotencyKey: z.string().min(8).optional(),
  }),
});

// Public reads
router.get(
  '/room-types',
  asyncHandler(async (req, res) => {
    const includeInactive = req.query.all === 'true';
    res.json(await accommodationService.listRoomTypes(includeInactive));
  })
);

router.get(
  '/room-types/:id/availability',
  asyncHandler(async (req, res) => {
    const { from, to } = req.query;
    const rooms = await accommodationService.availableRooms(
      req.params.id,
      new Date(String(from)),
      new Date(String(to))
    );
    res.json({ availableCount: rooms.length, rooms });
  })
);

// Booking flow
router.post(
  '/reserve',
  sensitiveLimiter,
  optionalAuth,
  validate(reserveSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(
      await accommodationService.reserve({ ...req.body, userId: req.user?.userId })
    );
  })
);

router.post(
  '/:id/confirm',
  sensitiveLimiter,
  asyncHandler(async (req, res) => {
    res.json(await accommodationService.confirm(req.params.id, req.body));
  })
);

// Admin
router.post(
  '/room-types',
  authenticate,
  requireRole('ADMIN'),
  validate(createRoomTypeSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await accommodationService.createRoomType(req.body));
  })
);

router.post(
  '/room-types/:id/rooms',
  authenticate,
  requireRole('ADMIN'),
  validate(addRoomSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await accommodationService.addRoom(req.params.id, req.body.number));
  })
);

router.get(
  '/bookings',
  authenticate,
  requireRole('ADMIN'),
  asyncHandler(async (_req, res) => {
    res.json(await accommodationService.list());
  })
);

export default router;
