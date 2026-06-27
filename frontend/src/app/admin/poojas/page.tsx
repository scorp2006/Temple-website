'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, CalendarPlus } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { api } from '@/lib/api';
import { formatINR, formatDateTime } from '@/lib/format';
import { DashboardShell, Panel } from '@/components/dashboard/DashboardShell';
import { DataTable } from '@/components/dashboard/Table';
import { adminNav } from '@/components/dashboard/adminNav';

interface Pooja { id: string; name: string; basePrice: number; isSpecial: boolean; isActive: boolean; }
interface Slot { id: string; startTime: string; capacity: number; booked: number; price: number; }

export default function AdminPoojas() {
  const { user, loading } = useAuth(['ADMIN']);
  const [poojas, setPoojas] = useState<Pooja[]>([]);
  const [busy, setBusy] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', basePrice: 100, isSpecial: false });
  const [msg, setMsg] = useState<string | null>(null);

  // Slot management for a selected pooja
  const [selected, setSelected] = useState<Pooja | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bulk, setBulk] = useState({
    startDate: '', endDate: '', dailyStartTime: '06:00', dailyEndTime: '18:00',
    slotDurationMinutes: 30, capacity: 50,
  });
  const [bulkMsg, setBulkMsg] = useState<string | null>(null);

  const load = () => {
    setBusy(true);
    api<Pooja[]>('/poojas?all=true', { auth: true }).then(setPoojas).catch(() => {}).finally(() => setBusy(false));
  };
  useEffect(() => { if (user) load(); }, [user]);

  const loadSlots = (p: Pooja) => {
    setSelected(p);
    setSlots([]);
    api<Slot[]>(`/poojas/${p.id}/slots`).then(setSlots).catch(() => {});
  };

  async function createPooja() {
    try {
      await api('/poojas', { method: 'POST', auth: true, body: JSON.stringify({ ...form, basePrice: form.basePrice * 100 }) });
      setMsg('Pooja created.'); setShowForm(false);
      setForm({ name: '', description: '', basePrice: 100, isSpecial: false });
      load();
    } catch (e) { setMsg((e as Error).message); }
  }

  async function generateSlots() {
    if (!selected) return;
    setBulkMsg(null);
    try {
      const res = await api<{ generated: number }>('/poojas/slots/bulk', {
        method: 'POST', auth: true,
        body: JSON.stringify({ poojaId: selected.id, ...bulk }),
      });
      setBulkMsg(`Generated ${res.generated} slots.`);
      loadSlots(selected);
    } catch (e) { setBulkMsg((e as Error).message); }
  }

  if (loading || !user)
    return <div className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>;

  return (
    <DashboardShell user={user} nav={adminNav} title="Admin">
      <div className="space-y-6">
        {msg && <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-700">{msg}</p>}

        <Panel
          title="Poojas"
          action={<button onClick={() => setShowForm((s) => !s)} className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"><Plus className="h-4 w-4" /> New Pooja</button>}
        >
          {showForm && (
            <div className="mb-5 space-y-3 rounded-lg bg-slate-50 p-4">
              <input className="dash-input" placeholder="Pooja name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <textarea className="dash-input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="flex flex-wrap items-center gap-4">
                <label className="text-sm text-slate-600">Price (₹) <input type="number" className="dash-input ml-2 w-28" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} /></label>
                <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={form.isSpecial} onChange={(e) => setForm({ ...form, isSpecial: e.target.checked })} /> Special pooja</label>
              </div>
              <button onClick={createPooja} disabled={!form.name} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Create</button>
            </div>
          )}

          <DataTable
            loading={busy}
            rows={poojas}
            keyField={(p) => p.id}
            empty="No poojas yet."
            columns={[
              { header: 'Name', cell: (p) => <span className="font-medium text-slate-800">{p.name}</span> },
              { header: 'Price', cell: (p) => formatINR(p.basePrice) },
              { header: 'Special', cell: (p) => (p.isSpecial ? '⭐' : '—') },
              { header: 'Active', cell: (p) => (p.isActive ? '✓' : '✗') },
              { header: 'Slots', cell: (p) => <button onClick={() => loadSlots(p)} className="text-sm font-medium text-red-600 hover:underline">Manage slots →</button> },
            ]}
          />
        </Panel>

        {selected && (
          <Panel title={`Slots — ${selected.name}`}>
            {/* Bulk slot generator */}
            <div className="mb-5 rounded-lg bg-slate-50 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700"><CalendarPlus className="h-4 w-4" /> Bulk-generate slots for a date range</h3>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <label className="text-xs text-slate-500">Start date<input type="date" className="dash-input mt-1" value={bulk.startDate} onChange={(e) => setBulk({ ...bulk, startDate: e.target.value })} /></label>
                <label className="text-xs text-slate-500">End date<input type="date" className="dash-input mt-1" value={bulk.endDate} onChange={(e) => setBulk({ ...bulk, endDate: e.target.value })} /></label>
                <label className="text-xs text-slate-500">Daily start<input type="time" className="dash-input mt-1" value={bulk.dailyStartTime} onChange={(e) => setBulk({ ...bulk, dailyStartTime: e.target.value })} /></label>
                <label className="text-xs text-slate-500">Daily end<input type="time" className="dash-input mt-1" value={bulk.dailyEndTime} onChange={(e) => setBulk({ ...bulk, dailyEndTime: e.target.value })} /></label>
                <label className="text-xs text-slate-500">Duration (min)<input type="number" className="dash-input mt-1" value={bulk.slotDurationMinutes} onChange={(e) => setBulk({ ...bulk, slotDurationMinutes: Number(e.target.value) })} /></label>
                <label className="text-xs text-slate-500">Capacity<input type="number" className="dash-input mt-1" value={bulk.capacity} onChange={(e) => setBulk({ ...bulk, capacity: Number(e.target.value) })} /></label>
              </div>
              <button onClick={generateSlots} disabled={!bulk.startDate || !bulk.endDate} className="mt-3 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Generate slots</button>
              {bulkMsg && <p className="mt-2 text-sm text-slate-600">{bulkMsg}</p>}
            </div>

            <DataTable
              rows={slots}
              keyField={(s) => s.id}
              empty="No upcoming slots. Generate some above."
              columns={[
                { header: 'Time', cell: (s) => formatDateTime(s.startTime) },
                { header: 'Price', cell: (s) => formatINR(s.price) },
                { header: 'Booked', cell: (s) => `${s.booked} / ${s.capacity}` },
                { header: 'Availability', cell: (s) => <span className={s.capacity - s.booked > 0 ? 'text-green-600' : 'text-red-600'}>{Math.max(0, s.capacity - s.booked)} left</span> },
              ]}
            />
          </Panel>
        )}
      </div>
    </DashboardShell>
  );
}
