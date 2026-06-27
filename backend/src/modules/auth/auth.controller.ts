import { Request, Response } from 'express';
import { authService } from './auth.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.json(result);
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const user = await authService.me(req.user.userId);
    res.json(user);
  }),

  listStaff: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await authService.listStaff());
  }),

  createStaff: asyncHandler(async (req: Request, res: Response) => {
    const staff = await authService.createStaff(req.body);
    res.status(201).json(staff);
  }),

  setRole: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.setRole(req.params.id, req.body.role);
    res.json(user);
  }),
};
