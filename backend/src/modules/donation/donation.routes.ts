import { Router } from 'express';
import { z } from 'zod';
import { donationService } from './donation.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole, optionalAuth } from '../../middleware/auth';
import { sensitiveLimiter } from '../../middleware/rateLimiter';

const router = Router();

const createSchema = z.object({
  body: z.object({
    donorName: z.string().min(2),
    donorPhone: z.string().min(7).max(15).optional(),
    donorEmail: z.string().email().optional(),
    panNumber: z.string().optional(),
    amount: z.number().int().positive(),
    purpose: z.string().optional(),
    idempotencyKey: z.string().min(8).optional(),
  }),
});

router.post(
  '/',
  sensitiveLimiter,
  optionalAuth,
  validate(createSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await donationService.create({ ...req.body, userId: req.user?.userId }));
  })
);

router.post(
  '/:id/confirm',
  sensitiveLimiter,
  asyncHandler(async (req, res) => {
    res.json(await donationService.confirm(req.params.id, req.body));
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await donationService.get(req.params.id));
  })
);

router.get(
  '/',
  authenticate,
  requireRole('ADMIN'),
  asyncHandler(async (_req, res) => {
    res.json(await donationService.list());
  })
);

export default router;
