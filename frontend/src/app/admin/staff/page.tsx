'use client';

import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { api } from '@/lib/api';
import { Panel } from '@/components/dashboard/DashboardShell';
import { DataTable } from '@/components/dashboard/Table';

interface Staff { id: string; name: string; email?: string; phone?: string; role: string; }

export default function AdminStaff() {
  const [rows, setRows] = useState<Staff[]>([]);
  const [busy, setBusy] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState<string | null>(null);

  const load = () => { setBusy(true); api<Staff[]>('/auth/staff', { auth: true }).then(setRows).catch(() => {}).finally(() => setBusy(false)); };
  useEffect(() => { load(); }, []);

  async function createStaff() {
    setMsg(null);
    try {
      await api('/auth/staff', { method: 'POST', auth: true, body: JSON.stringify(form) });
      setForm({ name: '', email: '', password: '' }); setShowForm(false); setMsg('Volunteer/staff account created.'); load();
    } catch (e) { setMsg((e as Error).message); }
  }

  async function changeRole(id: string, role: string) {
    try { await api(`/auth/users/${id}/role`, { method: 'PATCH', auth: true, body: JSON.stringify({ role }) }); load(); }
    catch (e) { setMsg((e as Error).message); }
  }

  return (
    
      <Panel
        title="Staff & Volunteers"
        action={<button onClick={() => setShowForm((s) => !s)} className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"><UserPlus className="h-4 w-4" /> Add Volunteer</button>}
      >
        {msg && <p className="mb-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">{msg}</p>}
        {showForm && (
          <div className="mb-5 grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-3">
            <input className="dash-input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="dash-input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="dash-input" type="password" placeholder="Temp password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <div className="sm:col-span-3"><button onClick={createStaff} disabled={!form.name || !form.password} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Create account</button></div>
          </div>
        )}
        <DataTable
          loading={busy}
          rows={rows}
          keyField={(r) => r.id}
          empty="No staff/volunteers yet."
          columns={[
            { header: 'Name', cell: (r) => <span className="font-medium text-slate-800">{r.name}</span> },
            { header: 'Email', cell: (r) => r.email ?? '—' },
            { header: 'Phone', cell: (r) => r.phone ?? '—' },
            { header: 'Role', cell: (r) => (
              <select value={r.role} onChange={(e) => changeRole(r.id, e.target.value)} className="rounded border border-slate-200 px-2 py-1 text-sm">
                <option value="STAFF">Volunteer / Staff</option>
                <option value="ADMIN">Admin</option>
                <option value="VISITOR">Visitor</option>
              </select>
            ) },
          ]}
        />
      </Panel>
    
  );
}
