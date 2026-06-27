import { Request, Response } from 'express';
import { BookingStatus } from '../../constants/enums';
import { bookingService } from './booking.service';
import { asyncHandler } from '../../utils/asyncHandler';

export const bookingController = {
  // Devotee: reserve seats (creates a hold + payment order)
  reserve: asyncHandler(async (req: Request, res: Response) => {
    const result = await bookingService.reserve({
      ...req.body,
      userId: req.user?.userId,
    });
    res.status(201).json(result);
  }),

  // Devotee: confirm after paying
  confirm: asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.confirm(req.params.id, req.body);
    res.json(booking);
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    res.json(await bookingService.get(req.params.id));
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    res.json(await bookingService.cancel(req.params.id));
  }),

  // Admin: list all bookings (optionally filter by status)
  list: asyncHandler(async (req: Request, res: Response) => {
    const status = req.query.status as BookingStatus | undefined;
    res.json(await bookingService.list({ status }));
  }),

  // Staff: walk-in spot booking
  spotBooking: asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.spotBooking(req.body);
    res.status(201).json(booking);
  }),

  // Staff: scan QR ticket at the venue
  scan: asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.checkIn(req.body.qrToken);
    res.json({ valid: true, booking });
  }),
};
