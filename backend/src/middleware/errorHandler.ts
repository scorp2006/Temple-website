import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

// Central error handler. Every thrown ApiError / ZodError / unknown error
// lands here and is turned into a consistent JSON response.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.flatten(),
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Unknown / unexpected error
  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err);
  return res.status(500).json({ error: 'Internal server error' });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'Route not found' });
}
