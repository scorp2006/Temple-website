import { Booking, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';

export class BookingRepository {
  findById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: { slot: { include: { pooja: true } }, payment: true },
    });
  }

  findByIdempotencyKey(key: string): Promise<Booking | null> {
    return prisma.booking.findUnique({ where: { idempotencyKey: key } });
  }

  findByQrToken(token: string) {
    return prisma.booking.findUnique({
      where: { qrToken: token },
      include: { slot: { include: { pooja: true } } },
    });
  }

  list(where: Prisma.BookingWhereInput = {}) {
    return prisma.booking.findMany({
      where,
      include: { slot: { include: { pooja: true } }, payment: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  update(id: string, data: Prisma.BookingUpdateInput) {
    return prisma.booking.update({ where: { id }, data });
  }
}

export const bookingRepository = new BookingRepository();
