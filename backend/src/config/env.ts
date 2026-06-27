import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  jwtSecret: required('JWT_SECRET', 'dev-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',

  paymentsMode: (process.env.PAYMENTS_MODE ?? 'mock') as 'mock' | 'razorpay',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? '',

  reservationHoldMinutes: parseInt(process.env.RESERVATION_HOLD_MINUTES ?? '10', 10),

  // Adaptive booking queue (load management)
  queueMaxConcurrent: parseInt(process.env.QUEUE_MAX_CONCURRENT ?? '50', 10),
  queueMaxWaitMs: parseInt(process.env.QUEUE_MAX_WAIT_MS ?? '30000', 10),
};
