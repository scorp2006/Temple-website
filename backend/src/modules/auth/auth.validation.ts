import { z } from 'zod';
import { Role } from '../../constants/enums';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email().optional(),
    phone: z.string().min(7).max(15).optional(),
    password: z.string().min(6),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    password: z.string().min(1),
  }),
});

export const createStaffSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email().optional(),
    phone: z.string().min(7).max(15).optional(),
    password: z.string().min(6),
  }),
});

export const setRoleSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ role: z.nativeEnum(Role) }),
});
