'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatINR, formatDateTime } from '@/lib/format';
import { Panel } from '@/components/dashboard/DashboardShell';
import { DataTable, StatusBadge } from '@/components/dashboard/Table';

interface Booking {
  id: string;
  devoteeName: string;
  devoteePhone?: string;
  seats: number;
  status: string;
  channel: string;
  createdAt: string;
  slot?: { startTime: string; pooja?: { name: string } };
  payment?: { amount: number } | null;
}

const FILTERS = ['ALL', 'PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'EXPIRED'];

export default function AdminBookings() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [busy, setBusy] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    setBusy(true);
    const q = filter === 'ALL' ? '' : `?status=${filter}`;
    api<Booking[]>(`/bookings${q}`, { auth: true })
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setBusy(false));
  }, [filter]);

  return (
    <Panel
        title="Pooja Bookings"
        action={
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm">
            {FILTERS.map((f) => <option key={f} value={f}>{f === 'ALL' ? 'All statuses' : f.replace('_', ' ')}</option>)}
          </select>
        }
      >
        <DataTable
          loading={busy}
          rows={rows}
          keyField={(r) => r.id}
          empty="No bookings yet."
          columns={[
            { header: 'Devotee', cell: (r) => <span className="font-medium text-slate-800">{r.devoteeName}</span> },
            { header: 'Pooja', cell: (r) => r.slot?.pooja?.name ?? '—' },
            { header: 'Slot', cell: (r) => (r.slot ? formatDateTime(r.slot.startTime) : '—') },
            { header: 'Seats', cell: (r) => r.seats },
            { header: 'Channel', cell: (r) => <span className="text-xs text-slate-500">{r.channel}</span> },
            { header: 'Amount', cell: (r) => (r.payment ? formatINR(r.payment.amount) : '—') },
            { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
          ]}
        />
      </Panel>
  );
}
