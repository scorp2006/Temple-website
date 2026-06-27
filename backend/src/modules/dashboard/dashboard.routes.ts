import { Router } from 'express';
import { BookingStatus, PaymentStatus } from '../../constants/enums';
import { prisma } from '../../config/prisma';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// Admin dashboard summary: bookings, donations, money collected.
router.get(
  '/summary',
  authenticate,
  requireRole('ADMIN'),
  asyncHandler(async (_req, res) => {
    const [
      totalBookings,
      confirmedBookings,
      checkedIn,
      totalDonations,
      donationSum,
      bookingRevenue,
      accommodationBookings,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: BookingStatus.CONFIRMED } }),
      prisma.booking.count({ where: { status: BookingStatus.CHECKED_IN } }),
      prisma.donation.count({ where: { status: PaymentStatus.PAID } }),
      prisma.donation.aggregate({
        where: { status: PaymentStatus.PAID },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: PaymentStatus.PAID },
        _sum: { amount: true },
      }),
      prisma.accommodationBooking.count({ where: { status: BookingStatus.CONFIRMED } }),
    ]);

    res.json({
      bookings: { total: totalBookings, confirmed: confirmedBookings, checkedIn },
      accommodation: { confirmed: accommodationBookings },
      donations: { count: totalDonations, totalAmount: donationSum._sum.amount ?? 0 },
      revenue: { totalAmount: bookingRevenue._sum.amount ?? 0 }, // all paid money (paise)
    });
  })
);

export default router;
