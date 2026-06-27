import { Router } from 'express';
import { poojaController } from './pooja.controller';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole, optionalAuth } from '../../middleware/auth';
import {
  createPoojaSchema,
  updatePoojaSchema,
  createSlotSchema,
  bulkSlotSchema,
  updateSlotSchema,
} from './pooja.validation';

const router = Router();

// Public reads
router.get('/', optionalAuth, poojaController.list);
router.get('/:id', poojaController.get);
router.get('/:id/slots', poojaController.listSlots);

// Admin writes
router.post('/', authenticate, requireRole('ADMIN'), validate(createPoojaSchema), poojaController.create);
router.patch('/:id', authenticate, requireRole('ADMIN'), validate(updatePoojaSchema), poojaController.update);

router.post('/slots', authenticate, requireRole('ADMIN'), validate(createSlotSchema), poojaController.createSlot);
router.post('/slots/bulk', authenticate, requireRole('ADMIN'), validate(bulkSlotSchema), poojaController.bulkGenerateSlots);
router.patch('/slots/:id', authenticate, requireRole('ADMIN'), validate(updateSlotSchema), poojaController.updateSlot);

export default router;
