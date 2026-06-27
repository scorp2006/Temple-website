'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { api } from '@/lib/api';
import { formatINR, formatDateTime } from '@/lib/format';
import { DashboardShell, Panel, StatCard } from '@/components/dashboard/DashboardShell';
import { DataTable, StatusBadge } from '@/components/dashboard/Table';
import { adminNav } from '@/components/dashboard/adminNav';

interface Donation {
  id: string; donorName: string; donorPhone?: string; amount: number;
  purpose?: string; status: string; createdAt: string;
}

export default function AdminDonations() {
  const { user, loading } = useAuth(['ADMIN']);
  const [rows, setRows] = useState<Donation[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!user) return;
    api<Donation[]>('/donations', { auth: true }).then(setRows).catch(() => setRows([])).finally(() => setBusy(false));
  }, [user]);

  if (loading || !user)
    return <div className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>;

  const paid = rows.filter((r) => r.status === 'PAID');
  const total = paid.reduce((s, r) => s + r.amount, 0);

  return (
    <DashboardShell user={user} nav={adminNav} title="Admin">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Total Donations" value={paid.length} accent="green" />
          <StatCard label="Total Amount" value={formatINR(total)} accent="indigo" />
          <StatCard label="Pending" value={rows.filter((r) => r.status === 'CREATED').length} accent="amber" />
        </div>
        <Panel title="Donations">
          <DataTable
            loading={busy}
            rows={rows}
            keyField={(r) => r.id}
            empty="No donations yet."
            columns={[
              { header: 'Donor', cell: (r) => <span className="font-medium text-slate-800">{r.donorName}</span> },
              { header: 'Phone', cell: (r) => r.donorPhone ?? '—' },
              { header: 'Purpose', cell: (r) => r.purpose ?? 'General' },
              { header: 'Amount', cell: (r) => formatINR(r.amount) },
              { header: 'Date', cell: (r) => formatDateTime(r.createdAt) },
              { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            ]}
          />
        </Panel>
      </div>
    </DashboardShell>
  );
}
