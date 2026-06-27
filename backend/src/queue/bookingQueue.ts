import { env } from '../config/env';

// ---------------------------------------------------------------------------
// Adaptive overflow queue (in-memory, single-instance).
//
// The booking row-lock already guarantees correctness (no overselling). This
// queue is purely about LOAD: under normal traffic everyone is admitted
// instantly; only when concurrent in-flight bookings exceed a threshold do
// extra requests wait in a FIFO line and get admitted as capacity frees up.
//
// Design goals (matches the client's "bare minimum, switch when overloaded"):
//   - Zero friction on normal days (threshold never reached).
//   - Fair FIFO admission during a surge.
//   - Bounded wait: a queued request gives up after queueMaxWaitMs.
//
// NOTE: in-memory state lives in this Node process. That's correct for a single
// backend instance (our Render deploy). To scale horizontally later, swap this
// module's internals for a Redis-backed queue — the public API stays the same.
// ---------------------------------------------------------------------------

interface Waiter {
  resolve: () => void;
  reject: (err: Error) => void;
  enqueuedAt: number;
  timer: NodeJS.Timeout;
}

class BookingQueue {
  private active = 0; // bookings currently being processed
  private waiting: Waiter[] = []; // FIFO line of overflow requests

  get max() {
    return env.queueMaxConcurrent;
  }

  /** Snapshot for monitoring / the status endpoint. */
  stats() {
    return {
      active: this.active,
      waiting: this.waiting.length,
      maxConcurrent: this.max,
      // queue only "engages" once we're at capacity with people waiting
      overloaded: this.active >= this.max && this.waiting.length > 0,
    };
  }

  /**
   * Acquire a slot to process a booking. Resolves immediately if under the
   * threshold; otherwise waits in line until admitted or times out.
   */
  acquire(): Promise<void> {
    if (this.active < this.max) {
      this.active += 1;
      return Promise.resolve();
    }
    // Over capacity -> join the waiting line.
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        // Remove this waiter on timeout.
        const i = this.waiting.findIndex((w) => w.timer === timer);
        if (i !== -1) this.waiting.splice(i, 1);
        reject(new QueueTimeoutError());
      }, env.queueMaxWaitMs);

      this.waiting.push({ resolve, reject, enqueuedAt: Date.now(), timer });
    });
  }

  /** Release a processing slot and admit the next waiter, if any. */
  release() {
    const next = this.waiting.shift();
    if (next) {
      clearTimeout(next.timer);
      // active stays the same: this admitted request takes the freed slot.
      next.resolve();
    } else if (this.active > 0) {
      this.active -= 1;
    }
  }

  /** Approximate position of a newly arriving request (for messaging). */
  positionForNew(): number {
    return this.waiting.length + 1;
  }
}

export class QueueTimeoutError extends Error {
  constructor() {
    super('The temple is experiencing very high traffic. Please try again in a moment.');
    this.name = 'QueueTimeoutError';
  }
}

export const bookingQueue = new BookingQueue();
