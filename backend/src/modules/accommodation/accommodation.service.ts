import { BookingStatus, PaymentPurpose } from '../../constants/enums';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import { paymentService } from '../payment/payment.service';

// ---------------------------------------------------------------------------
// Accommodation: room types, availability, and concurrency-safe booking.
// Availability = a room that has no overlapping CONFIRMED/PENDING booking for
// the requested date range.
// ---------------------------------------------------------------------------
export class AccommodationService {
  // --- Room types (admin) ---

  listRoomTypes(includeInactive = false) {
    return prisma.roomType.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: { _count: { select: { rooms: true } } },
      orderBy: { name: 'asc' },
    });
  }

  createRoomType(data: {
    name: string;
    description?: string;
    imageUrl?: string;
    pricePerNight: number;
    capacity: number;
  }) {
    return prisma.roomType.create({ data });
  }

  async addRoom(roomTypeId: string, number: string) {
    const type = await prisma.roomType.findUnique({ where: { id: roomTypeId } });
    if (!type) throw ApiError.notFound('Room type not found');
    return prisma.room.create({ data: { roomTypeId, number } });
  }

  // --- Availability ---

  // Rooms of a type that are free for the given range.
  async availableRooms(roomTypeId: string, checkIn: Date, checkOut: Date) {
    if (checkOut <= checkIn) throw ApiError.badRequest('checkOut must be after checkIn');

    const rooms = await prisma.room.findMany({
      where: { roomTypeId, isActive: true },
    });

    const overlapping = await prisma.accommodationBooking.findMany({
      where: {
        room: { roomTypeId },
        status: { in: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED] },
        // Overlap test: existing.checkIn < requested.checkOut AND existing.checkOut > requested.checkIn
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
      select: { roomId: true },
    });
    const taken = new Set(overlapping.map((b) => b.roomId));
    return rooms.filter((r) => !taken.has(r.id));
  }

  // --- Booking (reserve -> pay -> confirm) ---

  async reserve(input: {
    roomTypeId: string;
    checkIn: string;
    checkOut: string;
    guestName: string;
    guestPhone?: string;
    guestEmail?: string;
    guests?: number;
    userId?: string;
    idempotencyKey?: string;
  }) {
    if (input.idempotencyKey) {
      const existing = await prisma.accommodationBooking.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (existing) return prisma.accommodationBooking.findUnique({ where: { id: existing.id } });
    }

    const checkIn = new Date(input.checkIn);
    const checkOut = new Date(input.checkOut);
    const holdExpiresAt = new Date(Date.now() + env.reservationHoldMinutes * 60_000);

    const booking = await prisma.$transaction(async (tx) => {
      // Re-check availability inside the transaction and grab the first free room.
      const rooms = await tx.room.findMany({ where: { roomTypeId: input.roomTypeId, isActive: true } });
      const overlapping = await tx.accommodationBooking.findMany({
        where: {
          room: { roomTypeId: input.roomTypeId },
          status: { in: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED] },
          checkIn: { lt: checkOut },
          checkOut: { gt: checkIn },
        },
        select: { roomId: true },
      });
      const taken = new Set(overlapping.map((b) => b.roomId));
      const free = rooms.find((r) => !taken.has(r.id));
      if (!free) throw ApiError.conflict('No rooms available for the selected dates');

      return tx.accommodationBooking.create({
        data: {
          roomId: free.id,
          userId: input.userId,
          guestName: input.guestName,
          guestPhone: input.guestPhone,
          guestEmail: input.guestEmail,
          guests: input.guests ?? 1,
          checkIn,
          checkOut,
          status: BookingStatus.PENDING_PAYMENT,
          holdExpiresAt,
          idempotencyKey: input.idempotencyKey,
        },
      });
    });

    const type = await prisma.roomType.findUnique({ where: { id: input.roomTypeId } });
    const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86_400_000));
    const amount = (type?.pricePerNight ?? 0) * nights;
    const order = await paymentService.createOrder(PaymentPurpose.ACCOMMODATION, amount);

    await prisma.accommodationBooking.update({
      where: { id: booking.id },
      data: { paymentId: order.paymentId },
    });

    const full = await prisma.accommodationBooking.findUnique({
      where: { id: booking.id },
      include: { room: { include: { roomType: true } } },
    });
    return { booking: full, payment: order, nights };
  }

  async confirm(id: string, payment: { gatewayPaymentId?: string; gatewaySignature?: string }) {
    const booking = await prisma.accommodationBooking.findUnique({ where: { id } });
    if (!booking) throw ApiError.notFound('Booking not found');
    if (booking.status === BookingStatus.CONFIRMED) return booking;
    if (!booking.paymentId) throw ApiError.badRequest('No payment attached');
    if (booking.holdExpiresAt && booking.holdExpiresAt < new Date()) {
      throw ApiError.conflict('Reservation hold expired; please book again');
    }

    const paid = await paymentService.verifyPayment({ paymentId: booking.paymentId, ...payment });
    if (!paid) throw ApiError.badRequest('Payment verification failed');

    return prisma.accommodationBooking.update({
      where: { id },
      data: { status: BookingStatus.CONFIRMED, holdExpiresAt: null },
    });
  }

  list() {
    return prisma.accommodationBooking.findMany({
      include: { room: { include: { roomType: true } }, payment: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const accommodationService = new AccommodationService();
