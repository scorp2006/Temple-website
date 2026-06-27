import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole } from '../../middleware/auth';
import { sensitiveLimiter } from '../../middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  createStaffSchema,
  setRoleSchema,
} from './auth.validation';

const router = Router();

// Public
router.post('/register', sensitiveLimiter, validate(registerSchema), authController.register);
router.post('/login', sensitiveLimiter, validate(loginSchema), authController.login);

// Logged-in
router.get('/me', authenticate, authController.me);

// Admin-only staff management
router.get('/staff', authenticate, requireRole('ADMIN'), authController.listStaff);
router.post(
  '/staff',
  authenticate,
  requireRole('ADMIN'),
  validate(createStaffSchema),
  authController.createStaff
);
router.patch(
  '/users/:id/role',
  authenticate,
  requireRole('ADMIN'),
  validate(setRoleSchema),
  authController.setRole
);

export default router;
