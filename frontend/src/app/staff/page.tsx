'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScanLine, Loader2, CheckCircle2, XCircle, TicketPlus, LogOut } from 'lucide-react';
import { api, getToken, clearToken } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { DEMO_MODE, demoPoojas, demoSlots } from '@/lib/demo';
import { DemoBanner } from '@/components/DemoBanner';

export default function StaffPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(DEMO_MODE);
  const [tab, setTab] = useState<'scan' | 'spot'>('scan');

  useEffect(() => {
    if (DEMO_MODE) return; // preview mode: no auth required
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    api('/auth/me', { auth: true })
      .then(() => setAuthed(true))
      .catch(() => router.replace('/login'));
  }, [router]);

  if (!authed)
    return (
      <div className="section flex justify-center py-32 text-maroon-700">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );

  return (
    <div className="section max-w-2xl py-12">
      {DEMO_MODE && <DemoBanner />}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-maroon-700">Volunteer Portal</h1>
        <button
          onClick={() => {
            clearToken();
            router.push('/login');
          }}
          className="btn-outline px-4 py-2 text-sm"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        <button onClick={() => setTab('scan')} className={tabCls(tab === 'scan')}>
          <ScanLine className="h-4 w-4" /> Scan Ticket
        </button>
        <button onClick={() => setTab('spot')} className={tabCls(tab === 'spot')}>
          <TicketPlus className="h-4 w-4" /> Spot Booking
        </button>
      </div>

      {tab === 'scan' ? <ScanPanel /> : <SpotPanel />}
    </div>
  );
}

function tabCls(active: boolean) {
  return `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${
    active ? 'bg-maroon-600 text-cream' : 'bg-sand text-maroon-800'
  }`;
}

function ScanPanel() {
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string; booking?: any } | null>(null);

  async function scan() {
    if (!token) return;
    if (DEMO_MODE) {
      setResult({
        ok: true,
        msg: 'Preview: valid ticket — devotee would be checked in here.',
        booking: { devoteeName: 'Sample Devotee', slot: { pooja: { name: 'Abhishekam' }, startTime: new Date().toISOString() } },
      });
      setToken('');
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const res = await api<{ valid: boolean; booking: any }>('/bookings/scan', {
        method: 'POST',
        auth: true,
        body: JSON.stringify({ qrToken: token.trim() }),
      });
      setResult({ ok: true, msg: 'Valid ticket — checked in!', booking: res.booking });
    } catch (e) {
      setResult({ ok: false, msg: (e as Error).message });
    } finally {
      setBusy(false);
      setToken('');
    }
  }

  return (
    <div className="card p-6">
      <h2 className="font-serif text-xl font-bold text-maroon-700">Scan / Verify Ticket</h2>
      <p className="mt-1 text-sm text-maroon-800/60">
        Enter or scan the QR token from the devotee&apos;s e-ticket. (In production, a camera scanner
        via html5-qrcode fills this automatically.)
      </p>
      <div className="mt-4 flex gap-2">
        <input
          className="input"
          placeholder="TKT_xxxxxxxx"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && scan()}
        />
        <button onClick={scan} disabled={busy} className="btn-primary px-6 disabled:opacity-50">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify'}
        </button>
      </div>

      {result && (
        <div
          className={`mt-5 flex items-start gap-3 rounded-xl p-4 ${
            result.ok ? 'bg-green-50 text-green-800 ring-1 ring-green-200' : 'bg-kumkum/10 text-kumkum-dark ring-1 ring-kumkum/30'
          }`}
        >
          {result.ok ? <CheckCircle2 className="h-6 w-6 shrink-0" /> : <XCircle className="h-6 w-6 shrink-0" />}
          <div>
            <p className="font-semibold">{result.msg}</p>
            {result.booking && (
              <p className="mt-1 text-sm">
                {result.booking.devoteeName} · {result.booking.slot?.pooja?.name} ·{' '}
                {result.booking.slot && formatDateTime(result.booking.slot.startTime)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SpotPanel() {
  const [poojas, setPoojas] = useState<any[]>([]);
  const [poojaId, setPoojaId] = useState('');
  const [slots, setSlots] = useState<any[]>([]);
  const [slotId, setSlotId] = useState('');
  const [name, setName] = useState('');
  const [seats, setSeats] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (DEMO_MODE) { setPoojas(demoPoojas); return; }
    api<any[]>('/poojas').then(setPoojas).catch(() => {});
  }, []);

  useEffect(() => {
    if (DEMO_MODE) { if (poojaId) setSlots(demoSlots); return; }
    if (poojaId) api<any[]>(`/poojas/${poojaId}/slots`).then(setSlots).catch(() => setSlots([]));
  }, [poojaId]);

  async function createSpot() {
    if (DEMO_MODE) {
      setMsg({ ok: true, text: 'Preview: spot booking & ticket would be created here (backend pending).' });
      setName('');
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const b = await api<{ id: string }>('/bookings/spot', {
        method: 'POST',
        auth: true,
        body: JSON.stringify({ slotId, devoteeName: name, seats }),
      });
      setMsg({ ok: true, text: `Spot booking created & confirmed. Ticket ID: ${b.id}` });
      setName('');
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-6">
      <h2 className="font-serif text-xl font-bold text-maroon-700">Walk-in Spot Booking</h2>
      <p className="mt-1 text-sm text-maroon-800/60">Create & print a ticket for a walk-in devotee.</p>

      <div className="mt-4 space-y-4">
        <div>
          <label className="label">Pooja</label>
          <select className="input" value={poojaId} onChange={(e) => setPoojaId(e.target.value)}>
            <option value="">Select a pooja</option>
            {poojas.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Slot</label>
          <select className="input" value={slotId} onChange={(e) => setSlotId(e.target.value)} disabled={!poojaId}>
            <option value="">Select a slot</option>
            {slots.map((s) => (
              <option key={s.id} value={s.id}>
                {formatDateTime(s.startTime)} ({s.capacity - s.booked} left)
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Devotee name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Seats</label>
            <input type="number" min={1} className="input" value={seats} onChange={(e) => setSeats(Number(e.target.value))} />
          </div>
        </div>
      </div>

      {msg && (
        <p className={`mt-4 rounded-lg p-3 text-sm ${msg.ok ? 'bg-green-50 text-green-800' : 'bg-kumkum/10 text-kumkum-dark'}`}>
          {msg.text}
        </p>
      )}

      <button onClick={createSpot} disabled={busy || !slotId || !name} className="btn-primary mt-6 w-full disabled:opacity-50">
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create & Print Ticket'}
      </button>
    </div>
  );
}
