import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

const createSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    location: z.string().optional(),
  }),
});

const assignSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ userId: z.string().uuid() }),
});

// Admin: create events
router.post(
  '/',
  authenticate,
  requireRole('ADMIN'),
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const event = await prisma.event.create({
      data: {
        title: req.body.title,
        description: req.body.description,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
        location: req.body.location,
        createdById: req.user!.userId,
      },
    });
    res.status(201).json(event);
  })
);

// Admin: list all events; Staff: list events they're assigned to
router.get(
  '/',
  authenticate,
  requireRole('ADMIN', 'STAFF'),
  asyncHandler(async (req, res) => {
    if (req.user!.role === 'ADMIN') {
      const events = await prisma.event.findMany({
        include: { staff: { include: { user: { select: { id: true, name: true } } } } },
        orderBy: { startTime: 'asc' },
      });
      return res.json(events);
    }
    // Staff: only their assigned events
    const events = await prisma.event.findMany({
      where: { staff: { some: { userId: req.user!.userId } } },
      orderBy: { startTime: 'asc' },
    });
    res.json(events);
  })
);

// Admin: assign a staff member to an event
router.post(
  '/:id/staff',
  authenticate,
  requireRole('ADMIN'),
  validate(assignSchema),
  asyncHandler(async (req, res) => {
    const assignment = await prisma.eventStaff.create({
      data: { eventId: req.params.id, userId: req.body.userId },
    });
    res.status(201).json(assignment);
  })
);

export default router;
