import { Request, Response } from 'express';
import { poojaService } from './pooja.service';
import { asyncHandler } from '../../utils/asyncHandler';

export const poojaController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    // Admins (via ?all=true) can see inactive poojas too.
    const includeInactive = req.query.all === 'true' && req.user?.role === 'ADMIN';
    res.json(await poojaService.list(includeInactive));
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    res.json(await poojaService.get(req.params.id));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await poojaService.create(req.body));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await poojaService.update(req.params.id, req.body));
  }),

  listSlots: asyncHandler(async (req: Request, res: Response) => {
    const from = req.query.from ? new Date(String(req.query.from)) : new Date();
    res.json(await poojaService.listSlots(req.params.id, from));
  }),

  createSlot: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await poojaService.createSlot(req.body));
  }),

  bulkGenerateSlots: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await poojaService.bulkGenerateSlots(req.body));
  }),

  updateSlot: asyncHandler(async (req: Request, res: Response) => {
    res.json(await poojaService.updateSlot(req.params.id, req.body));
  }),
};
