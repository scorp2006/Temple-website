'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { api } from '@/lib/api';
import { formatINR, formatDateTime } from '@/lib/format';
import { DashboardShell, Panel } from '@/components/dashboard/DashboardShell';
import { DataTable, StatusBadge } from '@/components/dashboard/Table';
import { adminNav } from '@/components/dashboard/adminNav';

interface RoomType { id: string; name: string; pricePerNight: number; capacity: number; _count?: { rooms: number }; }
interface AccBooking { id: string; guestName: string; checkIn: string; checkOut: string; status: string; room?: { number: string; roomType?: { name: string } }; }

export default function AdminAccommodation() {
  const { user, loading } = useAuth(['ADMIN']);
  const [types, setTypes] = useState<RoomType[]>([]);
  const [bookings, setBookings] = useState<AccBooking[]>([]);
  const [busy, setBusy] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', pricePerNight: 1000, capacity: 2 });
  const [msg, setMsg] = useState<string | null>(null);

  const load = () => {
    setBusy(true);
    Promise.all([
      api<RoomType[]>('/accommodation/room-types?all=true', { auth: true }).then(setTypes).catch(() => {}),
      api<AccBooking[]>('/accommodation/bookings', { auth: true }).then(setBookings).catch(() => {}),
    ]).finally(() => setBusy(false));
  };
  useEffect(() => { if (user) load(); }, [user]);

  async function createType() {
    setMsg(null);
    try {
      await api('/accommodation/room-types', { method: 'POST', auth: true, body: JSON.stringify({ ...form, pricePerNight: form.pricePerNight * 100 }) });
      setForm({ name: '', description: '', pricePerNight: 1000, capacity: 2 }); setShowForm(false); load();
    } catch (e) { setMsg((e as Error).message); }
  }

  if (loading || !user)
    return <div className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>;

  return (
    <DashboardShell user={user} nav={adminNav} title="Admin">
      <div className="space-y-6">
        {msg && <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-700">{msg}</p>}
        <Panel
          title="Room Types"
          action={<button onClick={() => setShowForm((s) => !s)} className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"><Plus className="h-4 w-4" /> New Room Type</button>}
        >
          {showForm && (
            <div className="mb-5 grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
              <input className="dash-input" placeholder="Name (e.g. AC Double Room)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="dash-input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <label className="text-sm text-slate-600">Price/night (₹)<input type="number" className="dash-input mt-1" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: Number(e.target.value) })} /></label>
              <label className="text-sm text-slate-600">Capacity<input type="number" className="dash-input mt-1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></label>
              <div className="sm:col-span-2"><button onClick={createType} disabled={!form.name} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Create</button></div>
            </div>
          )}
          <DataTable
            loading={busy}
            rows={types}
            keyField={(t) => t.id}
            empty="No room types yet."
            columns={[
              { header: 'Name', cell: (t) => <span className="font-medium text-slate-800">{t.name}</span> },
              { header: 'Price/night', cell: (t) => formatINR(t.pricePerNight) },
              { header: 'Capacity', cell: (t) => t.capacity },
              { header: 'Rooms', cell: (t) => t._count?.rooms ?? 0 },
            ]}
          />
        </Panel>

        <Panel title="Room Bookings">
          <DataTable
            loading={busy}
            rows={bookings}
            keyField={(b) => b.id}
            empty="No room bookings yet."
            columns={[
              { header: 'Guest', cell: (b) => <span className="font-medium text-slate-800">{b.guestName}</span> },
              { header: 'Room', cell: (b) => `${b.room?.roomType?.name ?? '—'} ${b.room?.number ?? ''}` },
              { header: 'Check-in', cell: (b) => formatDateTime(b.checkIn) },
              { header: 'Check-out', cell: (b) => formatDateTime(b.checkOut) },
              { header: 'Status', cell: (b) => <StatusBadge status={b.status} /> },
            ]}
          />
        </Panel>
      </div>
    </DashboardShell>
  );
}
