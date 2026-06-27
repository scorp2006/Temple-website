import { PrismaClient } from '@prisma/client';

// Single shared Prisma client instance.
// Prisma manages the connection pool internally, so we reuse one client
// across the whole app rather than creating new connections per request.
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
