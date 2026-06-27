'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Calendar, Newspaper, Radio, Loader2, LogOut, Plus, IndianRupee, Ticket, Users,
} from 'lucide-react';
import { api, getToken, clearToken } from '@/lib/api';
import { formatINR, formatDateTime } from '@/lib/format';
import { DEMO_MODE, demoSummary, demoPoojas, demoNews } from '@/lib/demo';
import { DemoBanner } from '@/components/DemoBanner';

type Tab = 'overview' | 'poojas' | 'news' | 'live';

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(DEMO_MODE); // demo mode skips the login guard
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => {
    if (DEMO_MODE) return; // preview mode: no auth required
    if (!getToken()) return router.replace('/login');
    api<{ role: string }>('/auth/me', { auth: true })
      .then((u) => (u.role === 'ADMIN' ? setAuthed(true) : router.replace('/login')))
      .catch(() => router.replace('/login'));
  }, [router]);

  if (!authed)
    return (
      <div className="section flex justify-center py-32 text-maroon-700">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'poojas', label: 'Poojas & Slots', icon: Calendar },
    { key: 'news', label: 'News', icon: Newspaper },
    { key: 'live', label: 'Live Stream', icon: Radio },
  ];

  return (
    <div className="section py-12">
      {DEMO_MODE && <DemoBanner />}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-maroon-700">Admin Dashboard</h1>
        <button onClick={() => { clearToken(); router.push('/login'); }} className="btn-outline px-4 py-2 text-sm">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${
              tab === t.key ? 'bg-maroon-600 text-cream' : 'bg-sand text-maroon-800'
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <Overview />}
      {tab === 'poojas' && <PoojasAdmin />}
      {tab === 'news' && <NewsAdmin />}
      {tab === 'live' && <LiveAdmin />}
    </div>
  );
}

function Overview() {
  const [data, setData] = useState<any>(DEMO_MODE ? demoSummary : null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (DEMO_MODE) return;
    api('/dashboard/summary', { auth: true }).then(setData).catch((e) => setErr(e.message));
  }, []);
  if (err) return <p className="text-red-600">{err}</p>;
  if (!data) return <Loader2 className="h-6 w-6 animate-spin text-maroon-600" />;

  const cards = [
    { label: 'Total Bookings', value: data.bookings.total, icon: Ticket, color: 'bg-maroon-600' },
    { label: 'Confirmed', value: data.bookings.confirmed, icon: Ticket, color: 'bg-green-600' },
    { label: 'Checked In', value: data.bookings.checkedIn, icon: Users, color: 'bg-kumkum' },
    { label: 'Donations', value: data.donations.count, icon: IndianRupee, color: 'bg-pasupu-dark' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.color} text-white`}>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-2xl font-bold text-maroon-700">{c.value}</p>
            <p className="text-sm text-maroon-800/60">{c.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card p-6">
          <p className="text-sm text-maroon-800/60">Total Revenue (all paid)</p>
          <p className="mt-1 font-serif text-3xl font-bold text-kumkum-dark">{formatINR(data.revenue.totalAmount)}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-maroon-800/60">Donation Total</p>
          <p className="mt-1 font-serif text-3xl font-bold text-kumkum-dark">{formatINR(data.donations.totalAmount)}</p>
        </div>
      </div>
    </div>
  );
}

function PoojasAdmin() {
  const [poojas, setPoojas] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', basePrice: 100, isSpecial: false });
  const [msg, setMsg] = useState<string | null>(null);

  const load = () =>
    DEMO_MODE
      ? setPoojas(demoPoojas)
      : api<any[]>('/poojas?all=true', { auth: true }).then(setPoojas).catch(() => {});
  useEffect(() => { load(); }, []);

  async function create() {
    try {
      await api('/poojas', {
        method: 'POST',
        auth: true,
        body: JSON.stringify({ ...form, basePrice: form.basePrice * 100 }),
      });
      setMsg('Pooja created.');
      setShowForm(false);
      setForm({ name: '', description: '', basePrice: 100, isSpecial: false });
      load();
    } catch (e) {
      setMsg((e as Error).message);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold text-maroon-700">Poojas</h2>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary px-4 py-2 text-sm">
          <Plus className="h-4 w-4" /> New Pooja
        </button>
      </div>

      {msg && <p className="mb-4 rounded-lg bg-sand p-3 text-sm text-maroon-800">{msg}</p>}

      {showForm && (
        <div className="card mb-6 space-y-3 p-5">
          <input className="input" placeholder="Pooja name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea className="input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex items-center gap-4">
            <label className="label mb-0">Price (₹)</label>
            <input type="number" className="input w-32" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} />
            <label className="flex items-center gap-2 text-sm text-maroon-800">
              <input type="checkbox" checked={form.isSpecial} onChange={(e) => setForm({ ...form, isSpecial: e.target.checked })} /> Special
            </label>
          </div>
          <button onClick={create} disabled={!form.name} className="btn-primary disabled:opacity-50">Create</button>
        </div>
      )}

      <div className="overflow-x-auto card">
        <table className="w-full text-left text-sm">
          <thead className="bg-maroon-50 text-maroon-700">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Special</th>
              <th className="p-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {poojas.map((p) => (
              <tr key={p.id} className="border-t border-sand">
                <td className="p-3 font-medium text-maroon-800">{p.name}</td>
                <td className="p-3">{formatINR(p.basePrice)}</td>
                <td className="p-3">{p.isSpecial ? '⭐' : '—'}</td>
                <td className="p-3">{p.isActive ? '✓' : '✗'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {poojas.length === 0 && <p className="p-6 text-center text-maroon-800/60">No poojas yet.</p>}
      </div>
    </div>
  );
}

function NewsAdmin() {
  const [news, setNews] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', body: '' });
  const [msg, setMsg] = useState<string | null>(null);

  const load = () =>
    DEMO_MODE
      ? setNews(demoNews)
      : api<any[]>('/news?all=true', { auth: true }).then(setNews).catch(() => {});
  useEffect(() => { load(); }, []);

  async function publish() {
    try {
      await api('/news', { method: 'POST', auth: true, body: JSON.stringify(form) });
      setForm({ title: '', body: '' });
      setMsg('Published.');
      load();
    } catch (e) {
      setMsg((e as Error).message);
    }
  }

  return (
    <div>
      <h2 className="mb-4 font-serif text-xl font-bold text-maroon-700">Manage News</h2>
      {msg && <p className="mb-4 rounded-lg bg-sand p-3 text-sm text-maroon-800">{msg}</p>}
      <div className="card mb-6 space-y-3 p-5">
        <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="input min-h-[120px]" placeholder="Announcement body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        <button onClick={publish} disabled={!form.title || !form.body} className="btn-primary disabled:opacity-50">Publish</button>
      </div>
      <div className="space-y-3">
        {news.map((n) => (
          <div key={n.id} className="card p-4">
            <p className="font-semibold text-maroon-800">{n.title}</p>
            <p className="text-xs text-maroon-800/50">{formatDateTime(n.publishedAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveAdmin() {
  const [form, setForm] = useState({ title: 'Live Darshan', embedUrl: '', isVisible: true });
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    api<any>('/livestream').then((s) => s && setForm({ title: s.title ?? 'Live Darshan', embedUrl: s.embedUrl ?? '', isVisible: s.isVisible })).catch(() => {});
  }, []);

  async function save() {
    try {
      await api('/livestream', { method: 'PUT', auth: true, body: JSON.stringify(form) });
      setMsg('Saved.');
    } catch (e) {
      setMsg((e as Error).message);
    }
  }

  return (
    <div className="max-w-xl">
      <h2 className="mb-4 font-serif text-xl font-bold text-maroon-700">Live Stream Settings</h2>
      {msg && <p className="mb-4 rounded-lg bg-sand p-3 text-sm text-maroon-800">{msg}</p>}
      <div className="card space-y-4 p-5">
        <div>
          <label className="label">Title</label>
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="label">YouTube Embed URL</label>
          <input className="input" placeholder="https://www.youtube.com/embed/..." value={form.embedUrl} onChange={(e) => setForm({ ...form, embedUrl: e.target.value })} />
        </div>
        <label className="flex items-center gap-2 text-sm text-maroon-800">
          <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm({ ...form, isVisible: e.target.checked })} /> Visible on site
        </label>
        <button onClick={save} className="btn-primary">Save</button>
      </div>
    </div>
  );
}
