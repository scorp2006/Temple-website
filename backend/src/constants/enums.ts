// Application-level enums.
//
// Prisma's SQL Server connector does not support native DB enums, so these
// columns are stored as plain strings. We define the allowed values here and
// use these constants everywhere instead of importing enums from @prisma/client.

export const Role = {
  VISITOR: 'VISITOR',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const BookingStatus = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  CHECKED_IN: 'CHECKED_IN',
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const BookingChannel = {
  ONLINE: 'ONLINE',
  SPOT: 'SPOT',
} as const;
export type BookingChannel = (typeof BookingChannel)[keyof typeof BookingChannel];

export const PaymentStatus = {
  CREATED: 'CREATED',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentPurpose = {
  POOJA_BOOKING: 'POOJA_BOOKING',
  ACCOMMODATION: 'ACCOMMODATION',
  DONATION: 'DONATION',
} as const;
export type PaymentPurpose = (typeof PaymentPurpose)[keyof typeof PaymentPurpose];
