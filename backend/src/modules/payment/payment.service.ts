import crypto from 'crypto';
import { PaymentPurpose, PaymentStatus } from '../../constants/enums';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';

// ---------------------------------------------------------------------------
// Payment service.
//
// PAYMENTS_MODE=mock  -> a fake gateway that "creates an order" and verifies
//                        any payment as successful. Lets the whole booking ->
//                        pay -> confirm flow work end-to-end with no keys.
//
// PAYMENTS_MODE=razorpay -> swap in the real Razorpay SDK here (createOrder
//                           + verify signature). The rest of the app does not
//                           change because it only talks to this service.
// ---------------------------------------------------------------------------

export interface CreateOrderResult {
  paymentId: string; // our internal Payment.id
  gatewayOrderId: string; // Razorpay order id (or mock)
  amount: number;
  currency: string;
  // For mock mode we expose this so the frontend/dev can "pay" without a gateway.
  mock: boolean;
}

export class PaymentService {
  // Create a pending Payment row + a gateway order.
  async createOrder(purpose: PaymentPurpose, amount: number): Promise<CreateOrderResult> {
    if (amount <= 0) throw ApiError.badRequest('Amount must be positive');

    const gatewayOrderId =
      env.paymentsMode === 'mock'
        ? `mock_order_${crypto.randomUUID()}`
        : await this.createRazorpayOrder(amount);

    const payment = await prisma.payment.create({
      data: {
        purpose,
        amount,
        currency: 'INR',
        status: PaymentStatus.CREATED,
        gatewayOrderId,
      },
    });

    return {
      paymentId: payment.id,
      gatewayOrderId,
      amount,
      currency: 'INR',
      mock: env.paymentsMode === 'mock',
    };
  }

  // Verify a payment after the gateway callback. Returns true if paid.
  async verifyPayment(params: {
    paymentId: string;
    gatewayPaymentId?: string;
    gatewaySignature?: string;
  }): Promise<boolean> {
    const payment = await prisma.payment.findUnique({ where: { id: params.paymentId } });
    if (!payment) throw ApiError.notFound('Payment not found');
    if (payment.status === PaymentStatus.PAID) return true;

    let ok: boolean;
    if (env.paymentsMode === 'mock') {
      ok = true; // mock gateway always succeeds
    } else {
      ok = this.verifyRazorpaySignature(
        payment.gatewayOrderId ?? '',
        params.gatewayPaymentId ?? '',
        params.gatewaySignature ?? ''
      );
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: ok ? PaymentStatus.PAID : PaymentStatus.FAILED,
        gatewayPaymentId: params.gatewayPaymentId,
        gatewaySignature: params.gatewaySignature,
      },
    });

    return ok;
  }

  // --- Razorpay stubs (wire up the real SDK when PAYMENTS_MODE=razorpay) ---

  private async createRazorpayOrder(_amount: number): Promise<string> {
    // TODO: const order = await razorpay.orders.create({ amount, currency: 'INR' });
    //       return order.id;
    throw ApiError.badRequest(
      'Razorpay mode is not configured. Set PAYMENTS_MODE=mock or add Razorpay keys.'
    );
  }

  private verifyRazorpaySignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    const expected = crypto
      .createHmac('sha256', env.razorpayKeySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    return expected === signature;
  }
}

export const paymentService = new PaymentService();
