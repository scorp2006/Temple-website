'use client';

import { useEffect, useState } from 'react';
import { Loader2, BedDouble, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { formatINR } from '@/lib/format';
import { SectionHeading } from '@/components/SectionHeading';

interface RoomType {
  id: string;
  name: string;
  description?: string;
  pricePerNight: number;
  capacity: number;
  imageUrl?: string;
  _count?: { rooms: number };
}

const fallbackImg = '/images/temple-building.jpg';

export default function AccommodationPage() {
  const [types, setTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<RoomType | null>(null);
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const [form, setForm] = useState({ guestName: '', guestPhone: '', guestEmail: '', guests: 1 });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    api<RoomType[]>('/accommodation/room-types')
      .then(setTypes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function book() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      const key = `acc_${selected.id}_${Date.now()}`;
      const reserved = await api<{ booking: { id: string } }>('/accommodation/reserve', {
        method: 'POST',
        body: JSON.stringify({ roomTypeId: selected.id, ...dates, ...form, idempotencyKey: key }),
      });
      await api(`/accommodation/${reserved.booking.id}/confirm`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      setDone(reserved.booking.id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="section max-w-lg py-16 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
        <h1 className="mt-4 font-serif text-3xl font-bold text-maroon-700">Room Booked!</h1>
        <p className="mt-2 text-maroon-900/70">Your accommodation is confirmed. Booking ID: {done}</p>
        <button onClick={() => { setDone(null); setSelected(null); }} className="btn-primary mt-6">
          Book another room
        </button>
      </div>
    );
  }

  return (
    <div className="section py-12">
      <SectionHeading title="Accommodation" subtitle="Comfortable rooms and dormitories for pilgrims, close to the temple." />

      {loading && (
        <div className="flex items-center justify-center gap-2 py-20 text-maroon-700">
          <Loader2 className="h-6 w-6 animate-spin" /> Loading rooms...
        </div>
      )}

      {error && <div className="mb-6 rounded-xl bg-kumkum/10 p-4 text-sm text-kumkum-dark">{error}</div>}

      {!loading && !selected && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {types.map((rt) => (
            <div key={rt.id} className="card flex flex-col">
              <img src={rt.imageUrl || fallbackImg} alt={rt.name} loading="lazy" className="h-44 w-full object-cover" />
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-serif text-lg font-bold text-maroon-700">{rt.name}</h3>
                {rt.description && <p className="mt-1 text-sm text-maroon-900/60">{rt.description}</p>}
                <div className="mt-2 flex items-center gap-2 text-sm text-maroon-800/70">
                  <BedDouble className="h-4 w-4" /> Sleeps {rt.capacity}
                </div>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <span className="font-bold text-kumkum-dark">{formatINR(rt.pricePerNight)}<span className="text-xs font-normal">/night</span></span>
                  <button onClick={() => setSelected(rt)} className="btn-primary px-4 py-2 text-sm">
                    Select
                  </button>
                </div>
              </div>
            </div>
          ))}
          {types.length === 0 && <p className="py-12 text-center text-maroon-800/60">No room types configured yet.</p>}
        </div>
      )}

      {selected && (
        <div className="mx-auto max-w-xl card p-6">
          <button onClick={() => setSelected(null)} className="mb-4 text-sm text-maroon-600 hover:underline">
            ← Back to rooms
          </button>
          <h2 className="font-serif text-2xl font-bold text-maroon-700">{selected.name}</h2>
          <p className="text-kumkum-dark font-bold">{formatINR(selected.pricePerNight)}/night</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Check-in</label>
              <input type="date" className="input" value={dates.checkIn} onChange={(e) => setDates({ ...dates, checkIn: e.target.value })} />
            </div>
            <div>
              <label className="label">Check-out</label>
              <input type="date" className="input" value={dates.checkOut} onChange={(e) => setDates({ ...dates, checkOut: e.target.value })} />
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className="label">Guest name *</label>
              <input className="input" value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Phone</label>
                <input className="input" value={form.guestPhone} onChange={(e) => setForm({ ...form, guestPhone: e.target.value })} />
              </div>
              <div>
                <label className="label">Guests</label>
                <input type="number" min={1} max={selected.capacity} className="input" value={form.guests} onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })} />
              </div>
            </div>
          </div>

          <button
            onClick={book}
            disabled={busy || !form.guestName || !dates.checkIn || !dates.checkOut}
            className="btn-primary mt-6 w-full disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Book & Pay'}
          </button>
          <p className="mt-2 text-center text-xs text-maroon-800/50">Mock payment mode — no real charge is made.</p>
        </div>
      )}
    </div>
  );
}
