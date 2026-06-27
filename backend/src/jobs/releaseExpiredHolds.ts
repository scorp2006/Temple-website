import { bookingService } from '../modules/booking/booking.service';
import { prisma } from '../config/prisma';
import { BookingStatus } from '../constants/enums';

// ---------------------------------------------------------------------------
// Scheduled job: auto-release expired slot/room holds (PRD: "auto-release of
// slots"). Runs on an interval. In production you'd run this as a separate
// cron worker; here a simple setInterval is fine for a single-instance host.
// ---------------------------------------------------------------------------

async function releaseExpiredAccommodationHolds(): Promise<number> {
  const expired = await prisma.accommodationBooking.findMany({
    where: {
      status: BookingStatus.PENDING_PAYMENT,
      holdExpiresAt: { lt: new Date() },
    },
  });
  for (const b of expired) {
    await prisma.accommodationBooking.update({
      where: { id: b.id },
      data: { status: BookingStatus.EXPIRED, holdExpiresAt: null },
    });
  }
  return expired.length;
}

export function startHoldReleaseJob(intervalMs = 60_000) {
  const tick = async () => {
    try {
      const poojas = await bookingService.releaseAllExpiredHolds();
      const rooms = await releaseExpiredAccommodationHolds();
      if (poojas + rooms > 0) {
        // eslint-disable-next-line no-console
        console.log(`[holds] released ${poojas} pooja + ${rooms} room holds`);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[holds] release job error:', err);
    }
  };
  // Run shortly after boot, then on the interval.
  setTimeout(tick, 5_000);
  return setInterval(tick, intervalMs);
}
