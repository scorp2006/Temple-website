import { PaymentPurpose, PaymentStatus } from '../../constants/enums';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { paymentService } from '../payment/payment.service';
import { generateQrToken } from '../../utils/qr';

// ---------------------------------------------------------------------------
// Donation: create -> pay -> confirm, then issue a Donor Card (QR + receipt).
// ---------------------------------------------------------------------------
export class DonationService {
  async create(input: {
    donorName: string;
    donorPhone?: string;
    donorEmail?: string;
    panNumber?: string;
    amount: number;
    purpose?: string;
    userId?: string;
    idempotencyKey?: string;
  }) {
    if (input.amount <= 0) throw ApiError.badRequest('Amount must be positive');

    if (input.idempotencyKey) {
      const existing = await prisma.donation.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (existing) return { donation: existing };
    }

    const order = await paymentService.createOrder(PaymentPurpose.DONATION, input.amount);

    const donation = await prisma.donation.create({
      data: {
        donorName: input.donorName,
        donorPhone: input.donorPhone,
        donorEmail: input.donorEmail,
        panNumber: input.panNumber,
        amount: input.amount,
        purpose: input.purpose,
        userId: input.userId,
        idempotencyKey: input.idempotencyKey,
        paymentId: order.paymentId,
        status: PaymentStatus.CREATED,
      },
    });

    return { donation, payment: order };
  }

  async confirm(id: string, payment: { gatewayPaymentId?: string; gatewaySignature?: string }) {
    const donation = await prisma.donation.findUnique({ where: { id } });
    if (!donation) throw ApiError.notFound('Donation not found');
    if (donation.status === PaymentStatus.PAID) return donation;
    if (!donation.paymentId) throw ApiError.badRequest('No payment attached');

    const paid = await paymentService.verifyPayment({ paymentId: donation.paymentId, ...payment });
    if (!paid) throw ApiError.badRequest('Payment verification failed');

    // Issue the donor card token (QR + receipt details rendered by frontend/PDF).
    return prisma.donation.update({
      where: { id },
      data: { status: PaymentStatus.PAID, qrToken: generateQrToken('DONOR') },
    });
  }

  get(id: string) {
    return prisma.donation.findUnique({ where: { id } });
  }

  list() {
    return prisma.donation.findMany({ include: { payment: true }, orderBy: { createdAt: 'desc' } });
  }
}

export const donationService = new DonationService();
