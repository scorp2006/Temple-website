'use client';

import { useState } from 'react';
import { HeartHandshake, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { formatINR } from '@/lib/format';
import { SectionHeading } from '@/components/SectionHeading';

const presets = [10000, 50000, 100000, 250000]; // paise

export default function DonatePage() {
  const [amount, setAmount] = useState(50000);
  const [form, setForm] = useState({ donorName: '', donorPhone: '', donorEmail: '', panNumber: '', purpose: 'General' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string; qrToken: string | null } | null>(null);

  async function donate() {
    setBusy(true);
    setError(null);
    try {
      const key = `donate_${Date.now()}`;
      const created = await api<{ donation: { id: string } }>('/donations', {
        method: 'POST',
        body: JSON.stringify({ ...form, amount, idempotencyKey: key }),
      });
      const confirmed = await api<{ id: string; qrToken: string | null }>(
        `/donations/${created.donation.id}/confirm`,
        { method: 'POST', body: JSON.stringify({}) }
      );
      setDone({ id: confirmed.id, qrToken: confirmed.qrToken });
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
        <h1 className="mt-4 font-serif text-3xl font-bold text-maroon-700">Thank you for your generosity!</h1>
        <p className="mt-2 text-maroon-900/70">Your Donor Card has been generated.</p>
        <div className="mx-auto mt-6 max-w-xs rounded-2xl border-2 border-dashed border-gold bg-cream p-6">
          <p className="font-serif font-bold text-maroon-700">Donor Card</p>
          <p className="mt-1 text-sm text-maroon-800/70">{form.donorName}</p>
          <p className="text-lg font-bold text-kumkum-dark">{formatINR(amount)}</p>
          {done.qrToken && (
            <img
              alt="Donor QR"
              className="mx-auto mt-3 h-40 w-40"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(done.qrToken)}`}
            />
          )}
          <p className="mt-2 break-all text-xs text-maroon-800/50">Receipt: {done.id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section max-w-2xl py-12">
      <SectionHeading title="Make a Donation" subtitle="Your contribution supports the temple, its sevas, and annadanam." />

      <div className="card p-6">
        <div className="mb-6 flex items-center justify-center gap-2 text-kumkum">
          <HeartHandshake className="h-8 w-8" />
        </div>

        <label className="label">Select an amount</label>
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setAmount(p)}
              className={`rounded-lg border-2 py-3 font-semibold transition-colors ${
                amount === p ? 'border-maroon-600 bg-maroon-50 text-maroon-700' : 'border-sand text-maroon-800'
              }`}
            >
              {formatINR(p)}
            </button>
          ))}
        </div>
        <div className="mb-6">
          <label className="label">Or enter a custom amount (₹)</label>
          <input
            type="number"
            min={1}
            className="input"
            value={amount / 100}
            onChange={(e) => setAmount(Math.max(100, Number(e.target.value) * 100))}
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Full name *</label>
            <input className="input" value={form.donorName} onChange={(e) => setForm({ ...form, donorName: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.donorPhone} onChange={(e) => setForm({ ...form, donorPhone: e.target.value })} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" value={form.donorEmail} onChange={(e) => setForm({ ...form, donorEmail: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">PAN (for 80G receipt)</label>
              <input className="input" value={form.panNumber} onChange={(e) => setForm({ ...form, panNumber: e.target.value })} />
            </div>
            <div>
              <label className="label">Purpose</label>
              <select className="input" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}>
                <option>General</option>
                <option>Annadanam</option>
                <option>Temple Maintenance</option>
                <option>Go Samrakshana</option>
              </select>
            </div>
          </div>
        </div>

        {error && <p className="mt-4 rounded-lg bg-kumkum/10 p-3 text-sm text-kumkum-dark">{error}</p>}

        <button onClick={donate} disabled={busy || !form.donorName} className="btn-accent mt-6 w-full disabled:opacity-50">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : `Donate ${formatINR(amount)}`}
        </button>
        <p className="mt-2 text-center text-xs text-maroon-800/50">Mock payment mode — no real charge is made.</p>
      </div>
    </div>
  );
}
