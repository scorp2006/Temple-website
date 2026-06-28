'use client';

import { useEffect, useState } from 'react';
import { Loader2, Printer } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { Panel } from '@/components/dashboard/DashboardShell';

export default function StaffSpot() {
  const [poojas, setPoojas] = useState<any[]>([]);
  const [poojaId, setPoojaId] = useState('');
  const [slots, setSlots] = useState<any[]>([]);
  const [slotId, setSlotId] = useState('');
  const [name, setName] = useState('');
  const [seats, setSeats] = useState(1);
  const [busy, setBusy] = useState(false);
  const [ticket, setTicket] = useState<{ id: string; qrToken: string | null; pooja: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { api<any[]>('/poojas').then(setPoojas).catch(() => {}); }, []);
  useEffect(() => { if (poojaId) api<any[]>(`/poojas/${poojaId}/slots`).then(setSlots).catch(() => setSlots([])); }, [poojaId]);

  async function createSpot() {
    setBusy(true); setErr(null);
    try {
      const b = await api<{ id: string; qrToken: string | null }>('/bookings/spot', {
        method: 'POST', auth: true, body: JSON.stringify({ slotId, devoteeName: name, seats }),
      });
      const poojaName = poojas.find((p) => p.id === poojaId)?.name ?? '';
      setTicket({ id: b.id, qrToken: b.qrToken, pooja: poojaName });
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }

  return (
    
      <div className="max-w-xl">
        {ticket ? (
          <Panel title="Ticket Created">
            <div className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center print:border-black" id="ticket">
              <p className="font-semibold text-slate-800">{ticket.pooja}</p>
              <p className="text-sm text-slate-500">{name} · {seats} seat(s)</p>
              {ticket.qrToken && (
                <img alt="Ticket QR" className="mx-auto mt-3 h-40 w-40" src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticket.qrToken)}`} />
              )}
              <p className="mt-2 break-all text-xs text-slate-400">Booking: {ticket.id}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white"><Printer className="h-4 w-4" /> Print Ticket</button>
              <button onClick={() => { setTicket(null); setName(''); }} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">New booking</button>
            </div>
          </Panel>
        ) : (
          <Panel title="Walk-in Spot Booking">
            <p className="mb-4 text-sm text-slate-500">Create &amp; print a ticket for a walk-in devotee.</p>
            <div className="space-y-4">
              <label className="block text-sm text-slate-600">Pooja
                <select className="dash-input mt-1" value={poojaId} onChange={(e) => setPoojaId(e.target.value)}>
                  <option value="">Select a pooja</option>
                  {poojas.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </label>
              <label className="block text-sm text-slate-600">Slot
                <select className="dash-input mt-1" value={slotId} onChange={(e) => setSlotId(e.target.value)} disabled={!poojaId}>
                  <option value="">Select a slot</option>
                  {slots.map((s) => <option key={s.id} value={s.id}>{formatDateTime(s.startTime)} ({s.capacity - s.booked} left)</option>)}
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm text-slate-600">Devotee name<input className="dash-input mt-1" value={name} onChange={(e) => setName(e.target.value)} /></label>
                <label className="block text-sm text-slate-600">Seats<input type="number" min={1} className="dash-input mt-1" value={seats} onChange={(e) => setSeats(Number(e.target.value))} /></label>
              </div>
            </div>
            {err && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</p>}
            <button onClick={createSpot} disabled={busy || !slotId || !name} className="mt-5 w-full rounded-lg bg-red-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {busy ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Create & Print Ticket'}
            </button>
          </Panel>
        )}
      </div>
    
  );
}
