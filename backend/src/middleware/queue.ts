import { NextFunction, Request, Response } from 'express';
import { bookingQueue, QueueTimeoutError } from '../queue/bookingQueue';
import { ApiError } from '../utils/ApiError';

// Gate a route through the adaptive booking queue. Under normal load this is a
// no-op (instant acquire); under surge it makes the request wait its turn, and
// releases the slot once the handler finishes (success or error).
export async function queueGate(req: Request, res: Response, next: NextFunction) {
  try {
    await bookingQueue.acquire();
  } catch (err) {
    if (err instanceof QueueTimeoutError) {
      // 503 = service busy; client can show "try again shortly".
      return res.status(503).json({ error: err.message, queued: true });
    }
    return next(err);
  }

  // Ensure we always release the slot exactly once when the response finishes.
  let released = false;
  const release = () => {
    if (!released) {
      released = true;
      bookingQueue.release();
    }
  };
  res.on('finish', release);
  res.on('close', release);

  next();
}

// Lightweight status endpoint so the frontend can detect surge mode and show a
// "you're in a queue" hint if desired.
export function queueStatus(_req: Request, res: Response) {
  res.json(bookingQueue.stats());
}
