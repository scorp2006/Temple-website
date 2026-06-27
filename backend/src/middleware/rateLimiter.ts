import rateLimit from 'express-rate-limit';

// General API limiter - protects against bots/spam flooding the site.
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 requests / minute / IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
});

// Stricter limiter for sensitive endpoints (login, booking, payment).
export const sensitiveLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20, // 20 requests / minute / IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again shortly.' },
});
