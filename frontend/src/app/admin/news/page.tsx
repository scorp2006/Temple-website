'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { Panel } from '@/components/dashboard/DashboardShell';
import { DataTable } from '@/components/dashboard/Table';

interface News { id: string; title: string; body: string; isPublished: boolean; publishedAt: string; }

export default function AdminNews() {
  const [rows, setRows] = useState<News[]>([]);
  const [busy, setBusy] = useState(true);
  const [form, setForm] = useState({ title: '', body: '' });
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = () => { setBusy(true); api<News[]>('/news?all=true', { auth: true }).then(setRows).catch(() => {}).finally(() => setBusy(false)); };
  useEffect(() => { load(); }, []);

  async function publish() {
    try {
      await api('/news', { method: 'POST', auth: true, body: JSON.stringify(form) });
      setForm({ title: '', body: '' }); setShowForm(false); setMsg('Published.'); load();
    } catch (e) { setMsg((e as Error).message); }
  }
  async function remove(id: string) {
    try { await api(`/news/${id}`, { method: 'DELETE', auth: true }); load(); } catch (e) { setMsg((e as Error).message); }
  }

  return (
    
      <Panel
        title="News & Announcements"
        action={<button onClick={() => setShowForm((s) => !s)} className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"><Plus className="h-4 w-4" /> New Post</button>}
      >
        {msg && <p className="mb-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">{msg}</p>}
        {showForm && (
          <div className="mb-5 space-y-3 rounded-lg bg-slate-50 p-4">
            <input className="dash-input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea className="dash-input min-h-[120px]" placeholder="Announcement body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            <button onClick={publish} disabled={!form.title || !form.body} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Publish</button>
          </div>
        )}
        <DataTable
          loading={busy}
          rows={rows}
          keyField={(r) => r.id}
          empty="No announcements yet."
          columns={[
            { header: 'Title', cell: (r) => <span className="font-medium text-slate-800">{r.title}</span> },
            { header: 'Published', cell: (r) => formatDateTime(r.publishedAt) },
            { header: 'Status', cell: (r) => (r.isPublished ? 'Published' : 'Draft') },
            { header: '', cell: (r) => <button onClick={() => remove(r.id)} className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button> },
          ]}
        />
      </Panel>
    
  );
}
