'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, CheckCircle2, Calendar, Users, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { formatINR, formatDateTime } from '@/lib/format';

interface Pooja {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  imageUrl?: string;
}
interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  price: number;
}

type Step = 'select' | 'details' | 'paying' | 'done';

export default function PoojaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [pooja, setPooja] = useState<Pooja | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>('select');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [form, setForm] = useState({ devoteeName: '', devoteePhone: '', devoteeEmail: '', seats: 1 });
  const [busy, setBusy] = useState(false);
  const [ticket, setTicket] = useState<{ id: string; qrToken: string | null } | null>(null);

  useEffect(() => {
    Promise.all([api<Pooja>(`/poojas/${id}`), api<Slot[]>(`/poojas/${id}/slots`)])
      .then(([p, s]) => {
        setPooja(p);
        setSlots(s);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleBooking() {
    if (!selectedSlot) return;
    setBusy(true);
    setError(null);
    try {
      // STEP 1: reserve (creates a hold + mock payment order)
      const idempotencyKey = `book_${selectedSlot.id}_${Date.now()}`;
      const reserved = await api<{ booking: { id: string }; payment: { paymentId: string; mock: boolean } }>(
        '/bookings/reserve',
        {
          method: 'POST',
          body: JSON.stringify({ slotId: selectedSlot.id, ...form, idempotencyKey }),
        }
      );

      setStep('paying');

      // STEP 2: "pay" — in mock mode the gateway always succeeds. (Real Razorpay
      // checkout would open here.) Then confirm the booking.
      const confirmed = await api<{ id: string; qrToken: string | null }>(
        `/bookings/${reserved.booking.id}/confirm`,
        { method: 'POST', body: JSON.stringify({}) }
      );

      setTicket({ id: confirmed.id, qrToken: confirmed.qrToken });
      setStep('done');
    } catch (e) {
      setError((e as Error).message);
      setStep('details');
    } finally {
      setBusy(false);
    }
  }

  if (loading)
    return (
      <div className="section flex items-center justify-center gap-2 py-32 text-maroon-700">
        <Loader2 className="h-6 w-6 animate-spin" /> Loading...
      </div>
    );

  if (!pooja)
    return (
      <div className="section py-32 text-center">
        <p className="text-kumkum-dark">{error ?? 'Pooja not found.'}</p>
      </div>
    );

  return (
    <div className="section max-w-3xl py-12">
      <a href="/poojas" className="mb-6 inline-flex items-center gap-1 text-sm text-maroon-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to all poojas
      </a>

      <div className="card overflow-hidden">
        <img
          src={pooja.imageUrl || '/images/sanctum.jpg'}
          alt={pooja.name}
          className="h-48 w-full object-cover"
        />
        <div className="p-6">
          <h1 className="font-serif text-3xl font-bold text-maroon-700">{pooja.name}</h1>
          {pooja.description && <p className="mt-2 text-maroon-900/70">{pooja.description}</p>}
          <p className="mt-3 text-xl font-bold text-kumkum-dark">{formatINR(pooja.basePrice)}</p>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl bg-kumkum/10 p-4 text-sm text-kumkum-dark ring-1 ring-kumkum/30">
          {error}
        </div>
      )}

      {/* STEP: select slot */}
      {step === 'select' && (
        <section className="mt-8">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-bold text-maroon-700">
            <Calendar className="h-5 w-5 text-kumkum" /> Choose a time slot
          </h2>
          {slots.length === 0 ? (
            <p className="rounded-xl bg-sand p-6 text-center text-maroon-800/70">
              No upcoming slots available. Please check back later.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {slots.map((s) => {
                const left = s.capacity - s.booked;
                const full = left <= 0;
                return (
                  <button
                    key={s.id}
                    disabled={full}
                    onClick={() => {
                      setSelectedSlot(s);
                      setStep('details');
                    }}
                    className={`rounded-xl border-2 p-4 text-left transition-colors ${
                      full
                        ? 'cursor-not-allowed border-sand bg-sand/50 opacity-60'
                        : 'border-maroon-100 bg-white hover:border-maroon-400'
                    }`}
                  >
                    <p className="font-semibold text-maroon-800">{formatDateTime(s.startTime)}</p>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="font-bold text-kumkum-dark">{formatINR(s.price)}</span>
                      <span className={full ? 'text-kumkum-dark' : 'text-green-700'}>
                        {full ? 'Full' : `${left} seats left`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* STEP: details */}
      {step === 'details' && selectedSlot && (
        <section className="mt-8 card p-6">
          <h2 className="mb-1 font-serif text-xl font-bold text-maroon-700">Your details</h2>
          <p className="mb-5 text-sm text-maroon-800/60">
            Slot: {formatDateTime(selectedSlot.startTime)} · {formatINR(selectedSlot.price)}
          </p>
          <div className="space-y-4">
            <div>
              <label className="label">Full name *</label>
              <input
                className="input"
                value={form.devoteeName}
                onChange={(e) => setForm({ ...form, devoteeName: e.target.value })}
                placeholder="Devotee name"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Phone</label>
                <input
                  className="input"
                  value={form.devoteePhone}
                  onChange={(e) => setForm({ ...form, devoteePhone: e.target.value })}
                  placeholder="+91..."
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  value={form.devoteeEmail}
                  onChange={(e) => setForm({ ...form, devoteeEmail: e.target.value })}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="label">
                <Users className="mr-1 inline h-4 w-4" /> Number of seats
              </label>
              <input
                type="number"
                min={1}
                max={Math.max(1, selectedSlot.capacity - selectedSlot.booked)}
                className="input w-32"
                value={form.seats}
                onChange={(e) => setForm({ ...form, seats: Math.max(1, Number(e.target.value)) })}
              />
            </div>

            <div className="flex items-center justify-between border-t border-sand pt-4">
              <span className="text-lg font-semibold text-maroon-800">
                Total: {formatINR(selectedSlot.price * form.seats)}
              </span>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('select')} className="btn-outline">
                Back
              </button>
              <button
                onClick={handleBooking}
                disabled={busy || !form.devoteeName}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Proceed to Pay'}
              </button>
            </div>
            <p className="text-center text-xs text-maroon-800/50">
              Payments run in mock mode in this build — no real charge is made.
            </p>
          </div>
        </section>
      )}

      {/* STEP: paying */}
      {step === 'paying' && (
        <section className="mt-8 card p-10 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-maroon-600" />
          <p className="mt-4 font-semibold text-maroon-700">Processing payment...</p>
        </section>
      )}

      {/* STEP: done — e-ticket */}
      {step === 'done' && ticket && (
        <section className="mt-8 card p-8 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
          <h2 className="mt-4 font-serif text-2xl font-bold text-maroon-700">Booking Confirmed!</h2>
          <p className="mt-2 text-maroon-900/70">
            Your e-ticket has been generated. Show the QR code below at the temple entrance.
          </p>

          <div className="mx-auto mt-6 max-w-xs rounded-2xl border-2 border-dashed border-maroon-300 bg-cream p-6">
            <p className="text-sm font-semibold text-maroon-700">{pooja.name}</p>
            {ticket.qrToken ? (
              <img
                alt="Ticket QR"
                className="mx-auto mt-3 h-44 w-44"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  ticket.qrToken
                )}`}
              />
            ) : (
              <p className="mt-3 text-sm text-maroon-800/60">QR pending</p>
            )}
            <p className="mt-3 break-all text-xs text-maroon-800/60">Booking ID: {ticket.id}</p>
          </div>

          <a href="/poojas" className="btn-primary mt-8">
            Book another pooja
          </a>
        </section>
      )}
    </div>
  );
}
