'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { api } from '@/lib/api';
import { formatINR } from '@/lib/format';
import { DashboardShell, StatCard, Panel } from '@/components/dashboard/DashboardShell';
import { adminNav } from '@/components/dashboard/adminNav';

interface Summary {
  bookings: { total: number; confirmed: number; checkedIn: number };
  accommodation: { confirmed: number };
  donations: { count: number; totalAmount: number };
  revenue: { totalAmount: number };
}

export default function AdminHome() {
  const { user, loading } = useAuth(['ADMIN']);
  const [data, setData] = useState<Summary | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    api<Summary>('/dashboard/summary', { auth: true }).then(setData).catch((e) => setErr(e.message));
  }, [user]);

  if (loading || !user)
    return <div className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>;

  return (
    <DashboardShell user={user} nav={adminNav} title="Admin">
      <div className="space-y-6">
        {err && <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{err}</p>}

        <div>
          <h2 className="mb-1 text-xl font-semibold text-slate-800">Welcome back, {user.name.split(' ')[0]} 🙏</h2>
          <p className="text-sm text-slate-500">Here&apos;s what&apos;s happening at the temple today.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Bookings" value={data?.bookings.total ?? '—'} accent="indigo" />
          <StatCard label="Confirmed" value={data?.bookings.confirmed ?? '—'} accent="green" />
          <StatCard label="Checked In" value={data?.bookings.checkedIn ?? '—'} accent="amber" />
          <StatCard label="Donations" value={data?.donations.count ?? '—'} accent="red" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Panel title="Total Revenue (all paid)">
            <p className="text-3xl font-bold text-slate-800">{data ? formatINR(data.revenue.totalAmount) : '—'}</p>
          </Panel>
          <Panel title="Donation Total">
            <p className="text-3xl font-bold text-slate-800">{data ? formatINR(data.donations.totalAmount) : '—'}</p>
          </Panel>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Panel title="Accommodation">
            <p className="text-sm text-slate-500">Confirmed room bookings</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{data?.accommodation.confirmed ?? '—'}</p>
          </Panel>
          <Panel title="Quick links">
            <div className="flex flex-wrap gap-2 text-sm">
              <a href="/admin/poojas" className="rounded-lg bg-slate-100 px-3 py-2 hover:bg-slate-200">Manage Poojas</a>
              <a href="/admin/bookings" className="rounded-lg bg-slate-100 px-3 py-2 hover:bg-slate-200">View Bookings</a>
              <a href="/admin/news" className="rounded-lg bg-slate-100 px-3 py-2 hover:bg-slate-200">Post News</a>
              <a href="/admin/staff" className="rounded-lg bg-slate-100 px-3 py-2 hover:bg-slate-200">Manage Staff</a>
            </div>
          </Panel>
        </div>
      </div>
    </DashboardShell>
  );
}
