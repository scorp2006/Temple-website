import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

const updateSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    embedUrl: z.string().url().optional(),
    isVisible: z.boolean().optional(),
  }),
});

// There is a single LiveStream config row. Public reads it; admin updates it.
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const stream = await prisma.liveStream.findFirst();
    res.json(stream ?? { isVisible: false, embedUrl: null, title: 'Live Darshan' });
  })
);

router.put(
  '/',
  authenticate,
  requireRole('ADMIN'),
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    const existing = await prisma.liveStream.findFirst();
    const stream = existing
      ? await prisma.liveStream.update({ where: { id: existing.id }, data: req.body })
      : await prisma.liveStream.create({
          data: {
            title: req.body.title ?? 'Live Darshan',
            embedUrl: req.body.embedUrl ?? '',
            isVisible: req.body.isVisible ?? true,
          },
        });
    res.json(stream);
  })
);

export default router;
