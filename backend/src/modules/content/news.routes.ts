import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole, optionalAuth } from '../../middleware/auth';
import { ApiError } from '../../utils/ApiError';

const router = Router();

const createSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    body: z.string().min(1),
    imageUrl: z.string().url().optional(),
    isPublished: z.boolean().optional(),
  }),
});

const updateSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    title: z.string().min(2).optional(),
    body: z.string().min(1).optional(),
    imageUrl: z.string().url().optional(),
    isPublished: z.boolean().optional(),
  }),
});

// Public: published news only (admins see drafts via ?all=true)
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const showAll = req.query.all === 'true' && req.user?.role === 'ADMIN';
    const news = await prisma.news.findMany({
      where: showAll ? {} : { isPublished: true },
      orderBy: { publishedAt: 'desc' },
    });
    res.json(news);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const item = await prisma.news.findUnique({ where: { id: req.params.id } });
    if (!item) throw ApiError.notFound('News item not found');
    res.json(item);
  })
);

// Admin writes
router.post(
  '/',
  authenticate,
  requireRole('ADMIN'),
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const item = await prisma.news.create({
      data: { ...req.body, authorId: req.user!.userId },
    });
    res.status(201).json(item);
  })
);

router.patch(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    const item = await prisma.news.update({ where: { id: req.params.id }, data: req.body });
    res.json(item);
  })
);

router.delete(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    await prisma.news.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);

export default router;
