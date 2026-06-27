import { Router } from 'express';
import { bookingController } from './booking.controller';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole, optionalAuth } from '../../middleware/auth';
import { sensitiveLimiter } from '../../middleware/rateLimiter';
import { queueGate, queueStatus } from '../../middleware/queue';
import {
  reserveSchema,
  confirmSchema,
  spotBookingSchema,
  scanSchema,
} from './booking.validation';

const router = Router();

// Queue status (frontend can poll to show a "high traffic" hint)
router.get('/queue-status', queueStatus);

// Devotee booking flow (works for guests; optionalAuth links a user if logged in)
// queueGate: instant under normal load, FIFO waiting-room under surge.
router.post('/reserve', sensitiveLimiter, queueGate, optionalAuth, validate(reserveSchema), bookingController.reserve);
router.post('/:id/confirm', sensitiveLimiter, optionalAuth, validate(confirmSchema), bookingController.confirm);
router.get('/:id', bookingController.get);
router.post('/:id/cancel', optionalAuth, bookingController.cancel);

// Staff venue operations
router.post('/spot', authenticate, requireRole('STAFF', 'ADMIN'), validate(spotBookingSchema), bookingController.spotBooking);
router.post('/scan', authenticate, requireRole('STAFF', 'ADMIN'), validate(scanSchema), bookingController.scan);

// Admin dashboard
router.get('/', authenticate, requireRole('ADMIN'), bookingController.list);

export default router;
