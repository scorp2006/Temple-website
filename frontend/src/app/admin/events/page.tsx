'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { DashboardShell, Panel } from '@/components/dashboard/DashboardShell';
import { DataTable } from '@/components/dashboard/Table';
import { adminNav } from '@/components/dashboard/adminNav';

interface Event {
  id: string; title: string; location?: string; startTime: string; endTime: string;
  staff?: { user: { id: string; name: string } }[];
}
interface Staff { id: string; name: string; }

export default function AdminEvents() {
  const { user, loading } = useAuth(['ADMIN']);
  const [events, setEvents] = useState<Event[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [busy, setBusy] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', location: '', startTime: '', endTime: '' });
  const [msg, setMsg] = useState<string | null>(null);

  const load = () => {
    setBusy(true);
    Promise.all([
      api<Event[]>('/events', { auth: true }).then(setEvents).catch(() => {}),
      api<Staff[]>('/auth/staff', { auth: true }).then(setStaff).catch(() => {}),
    ]).finally(() => setBusy(false));
  };
  useEffect(() => { if (user) load(); }, [user]);

  async function createEvent() {
    setMsg(null);
    try {
      await api('/events', {
        method: 'POST', auth: true,
        body: JSON.stringify({
          ...form,
          startTime: new Date(form.startTime).toISOString(),
          endTime: new Date(form.endTime).toISOString(),
        }),
      });
      setForm({ title: '', description: '', location: '', startTime: '', endTime: '' }); setShowForm(false); load();
    } catch (e) { setMsg((e as Error).message); }
  }

  async function assign(eventId: string, userId: string) {
    if (!userId) return;
    try { await api(`/events/${eventId}/staff`, { method: 'POST', auth: true, body: JSON.stringify({ userId }) }); load(); }
    catch (e) { setMsg((e as Error).message); }
  }

  if (loading || !user)
    return <div className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>;

  return (
    <DashboardShell user={user} nav={adminNav} title="Admin">
      <Panel
        title="Events"
        action={<button onClick={() => setShowForm((s) => !s)} className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"><Plus className="h-4 w-4" /> New Event</button>}
      >
        {msg && <p className="mb-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">{msg}</p>}
        {showForm && (
          <div className="mb-5 grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
            <input className="dash-input" placeholder="Event title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="dash-input" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <label className="text-sm text-slate-600">Start<input type="datetime-local" className="dash-input mt-1" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></label>
            <label className="text-sm text-slate-600">End<input type="datetime-local" className="dash-input mt-1" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></label>
            <textarea className="dash-input sm:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="sm:col-span-2"><button onClick={createEvent} disabled={!form.title || !form.startTime || !form.endTime} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Create event</button></div>
          </div>
        )}
        <DataTable
          loading={busy}
          rows={events}
          keyField={(e) => e.id}
          empty="No events yet."
          columns={[
            { header: 'Event', cell: (e) => <span className="font-medium text-slate-800">{e.title}</span> },
            { header: 'When', cell: (e) => formatDateTime(e.startTime) },
            { header: 'Location', cell: (e) => e.location ?? '—' },
            { header: 'Assigned staff', cell: (e) => (e.staff && e.staff.length ? e.staff.map((s) => s.user.name).join(', ') : <span className="text-slate-400">None</span>) },
            { header: 'Assign', cell: (e) => (
              <select onChange={(ev) => assign(e.id, ev.target.value)} defaultValue="" className="rounded border border-slate-200 px-2 py-1 text-sm">
                <option value="">+ staff…</option>
                {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            ) },
          ]}
        />
      </Panel>
    </DashboardShell>
  );
}
