'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { api } from '@/lib/api';
import { DashboardShell, Panel } from '@/components/dashboard/DashboardShell';
import { adminNav } from '@/components/dashboard/adminNav';

export default function AdminLivestream() {
  const { user, loading } = useAuth(['ADMIN']);
  const [form, setForm] = useState({ title: 'Live Darshan', embedUrl: '', isVisible: true });
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    api<any>('/livestream').then((s) => s && setForm({ title: s.title ?? 'Live Darshan', embedUrl: s.embedUrl ?? '', isVisible: !!s.isVisible })).catch(() => {});
  }, [user]);

  async function save() {
    try { await api('/livestream', { method: 'PUT', auth: true, body: JSON.stringify(form) }); setMsg('Saved.'); }
    catch (e) { setMsg((e as Error).message); }
  }

  if (loading || !user)
    return <div className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>;

  return (
    <DashboardShell user={user} nav={adminNav} title="Admin">
      <div className="max-w-xl">
        <Panel title="Live Stream Settings">
          {msg && <p className="mb-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">{msg}</p>}
          <div className="space-y-4">
            <label className="block text-sm text-slate-600">Title<input className="dash-input mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label className="block text-sm text-slate-600">YouTube Embed URL<input className="dash-input mt-1" placeholder="https://www.youtube.com/embed/..." value={form.embedUrl} onChange={(e) => setForm({ ...form, embedUrl: e.target.value })} /></label>
            <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={form.isVisible} onChange={(e) => setForm({ ...form, isVisible: e.target.checked })} /> Visible on site</label>
            <button onClick={save} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white">Save</button>
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
