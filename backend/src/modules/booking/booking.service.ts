import { Prisma } from '@prisma/client';
import { BookingChannel, BookingStatus, PaymentPurpose } from '../../constants/enums';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import { bookingRepository, BookingRepository } from './booking.repository';
import { paymentService } from '../payment/payment.service';
import { generateQrToken } from '../../utils/qr';

interface ReserveInput {
  slotId: string;
  devoteeName: string;
  devoteePhone?: string;
  devoteeEmail?: string;
  seats: number;
  userId?: string;
  idempotencyKey?: string;
  channel?: BookingChannel;
}

export class BookingService {
  constructor(private readonly repo: BookingRepository = bookingRepository) {}

  // -------------------------------------------------------------------------
  // STEP 1: Reserve seats (concurrency-safe).
  //
  // We hold the seats inside a single DB transaction and increment the slot's
  // `booked` counter with a conditional update so two simultaneous requests
  // can NEVER oversell. The hold expires after RESERVATION_HOLD_MINUTES if the
  // devotee doesn't pay, freeing the seats again.
  // -------------------------------------------------------------------------
  async reserve(input: ReserveInput) {
    if (input.seats < 1) throw ApiError.badRequest('seats must be >= 1');

    // Idempotency: if this exact request was already made, return the same booking.
    if (input.idempotencyKey) {
      const existing = await this.repo.findByIdempotencyKey(input.idempotencyKey);
      if (existing) {
        return { booking: await this.repo.findById(existing.id), payment: null };
      }
    }

    const holdExpiresAt = new Date(Date.now() + env.reservationHoldMinutes * 60_000);

    const booking = await prisma.$transaction(async (tx) => {
      // First, free any expired holds on this slot so their seats are reusable.
      await this.releaseExpiredHoldsForSlot(tx, input.slotId);

      const slot = await tx.slot.findUnique({ where: { id: input.slotId } });
      if (!slot) throw ApiError.notFound('Slot not found');
      if (!slot.isOpen) throw ApiError.conflict('This slot is closed');
      if (slot.startTime < new Date()) throw ApiError.conflict('This slot is in the past');

      // Atomic conditional increment: only succeeds if there is enough room.
      // updateMany returns a count; 0 means the WHERE failed (slot full) and
      // no row was changed -> we reject. This is the core anti-oversell guard.
      const updated = await tx.slot.updateMany({
        where: {
          id: input.slotId,
          booked: { lte: slot.capacity - input.seats },
        },
        data: { booked: { increment: input.seats } },
      });

      if (updated.count === 0) {
        throw ApiError.conflict('Not enough seats available for this slot');
      }

      return tx.booking.create({
        data: {
          slotId: input.slotId,
          userId: input.userId,
          devoteeName: input.devoteeName,
          devoteePhone: input.devoteePhone,
          devoteeEmail: input.devoteeEmail,
          seats: input.seats,
          status: BookingStatus.PENDING_PAYMENT,
          channel: input.channel ?? BookingChannel.ONLINE,
          holdExpiresAt,
          idempotencyKey: input.idempotencyKey,
        },
      });
    });

    // Create the payment order for the held seats.
    const slot = await prisma.slot.findUnique({ where: { id: input.slotId } });
    const amount = (slot?.price ?? 0) * input.seats;
    const order = await paymentService.createOrder(PaymentPurpose.POOJA_BOOKING, amount);

    await this.repo.update(booking.id, { payment: { connect: { id: order.paymentId } } });

    return { booking: await this.repo.findById(booking.id), payment: order };
  }

  // -------------------------------------------------------------------------
  // STEP 2: Confirm after payment. Verifies the payment, then flips the
  // booking to CONFIRMED and issues the QR ticket token.
  // -------------------------------------------------------------------------
  async confirm(bookingId: string, payment: { gatewayPaymentId?: string; gatewaySignature?: string }) {
    const booking = await this.repo.findById(bookingId);
    if (!booking) throw ApiError.notFound('Booking not found');
    if (booking.status === BookingStatus.CONFIRMED) return booking;
    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      throw ApiError.conflict(`Booking cannot be confirmed (status: ${booking.status})`);
    }
    if (booking.holdExpiresAt && booking.holdExpiresAt < new Date()) {
      throw ApiError.conflict('Reservation hold expired; please book again');
    }
    if (!booking.paymentId) throw ApiError.badRequest('No payment attached to booking');

    const paid = await paymentService.verifyPayment({
      paymentId: booking.paymentId,
      gatewayPaymentId: payment.gatewayPaymentId,
      gatewaySignature: payment.gatewaySignature,
    });
    if (!paid) throw ApiError.badRequest('Payment verification failed');

    await this.repo.update(bookingId, {
      status: BookingStatus.CONFIRMED,
      qrToken: generateQrToken('TKT'),
      holdExpiresAt: null,
    });

    // NOTE: here is where you'd fire the confirmation email + WhatsApp and
    // generate the PDF e-ticket. Left as a hook for the notifications module.
    return this.repo.findById(bookingId);
  }

  // -------------------------------------------------------------------------
  // Staff "spot booking" for walk-in devotees: reserve + immediately confirm.
  // -------------------------------------------------------------------------
  async spotBooking(input: Omit<ReserveInput, 'channel'>) {
    const reserved = await this.reserve({ ...input, channel: BookingChannel.SPOT });
    if (!reserved.booking) throw ApiError.badRequest('Failed to reserve spot booking');
    return this.confirm(reserved.booking.id, {});
  }

  // -------------------------------------------------------------------------
  // Staff QR scan at the venue: validate the ticket and mark checked-in.
  // -------------------------------------------------------------------------
  async checkIn(qrToken: string) {
    const booking = await this.repo.findByQrToken(qrToken);
    if (!booking) throw ApiError.notFound('Invalid ticket');
    if (booking.status === BookingStatus.CHECKED_IN) {
      throw ApiError.conflict('Ticket already checked in');
    }
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw ApiError.conflict(`Ticket not valid (status: ${booking.status})`);
    }
    await this.repo.update(booking.id, {
      status: BookingStatus.CHECKED_IN,
      checkedInAt: new Date(),
    });
    return this.repo.findById(booking.id);
  }

  async cancel(bookingId: string) {
    const booking = await this.repo.findById(bookingId);
    if (!booking) throw ApiError.notFound('Booking not found');
    if (booking.status === BookingStatus.CANCELLED) return booking;

    await prisma.$transaction(async (tx) => {
      // Return the seats to the slot if they were still being counted.
      if (
        booking.status === BookingStatus.PENDING_PAYMENT ||
        booking.status === BookingStatus.CONFIRMED
      ) {
        await tx.slot.update({
          where: { id: booking.slotId },
          data: { booked: { decrement: booking.seats } },
        });
      }
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED, holdExpiresAt: null },
      });
    });
    return this.repo.findById(bookingId);
  }

  list(filter: { status?: BookingStatus; slotId?: string } = {}) {
    return this.repo.list(filter);
  }

  get(id: string) {
    return this.repo.findById(id);
  }

  // -------------------------------------------------------------------------
  // Auto-release expired holds. Called inside reserve() for the target slot,
  // and also run globally by a scheduled job (see jobs/releaseExpiredHolds).
  // -------------------------------------------------------------------------
  private async releaseExpiredHoldsForSlot(
    tx: Prisma.TransactionClient,
    slotId: string
  ) {
    const expired = await tx.booking.findMany({
      where: {
        slotId,
        status: BookingStatus.PENDING_PAYMENT,
        holdExpiresAt: { lt: new Date() },
      },
    });
    for (const b of expired) {
      await tx.slot.update({
        where: { id: slotId },
        data: { booked: { decrement: b.seats } },
      });
      await tx.booking.update({
        where: { id: b.id },
        data: { status: BookingStatus.EXPIRED, holdExpiresAt: null },
      });
    }
  }

  // Global sweep used by the cron job.
  async releaseAllExpiredHolds(): Promise<number> {
    const expired = await prisma.booking.findMany({
      where: {
        status: BookingStatus.PENDING_PAYMENT,
        holdExpiresAt: { lt: new Date() },
      },
    });
    let released = 0;
    for (const b of expired) {
      await prisma.$transaction(async (tx) => {
        await tx.slot.update({
          where: { id: b.slotId },
          data: { booked: { decrement: b.seats } },
        });
        await tx.booking.update({
          where: { id: b.id },
          data: { status: BookingStatus.EXPIRED, holdExpiresAt: null },
        });
      });
      released += 1;
    }
    return released;
  }
}

export const bookingService = new BookingService();
