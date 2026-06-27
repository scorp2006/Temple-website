'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { DashboardShell, Panel } from '@/components/dashboard/DashboardShell';
import { DataTable } from '@/components/dashboard/Table';
import { staffNav } from '@/components/dashboard/staffNav';

interface Event { id: string; title: string; location?: string; startTime: string; endTime: string; }

export default function StaffEvents() {
  const { user, loading } = useAuth(['STAFF', 'ADMIN']);
  const [rows, setRows] = useState<Event[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!user) return;
    // Backend returns only the events this staff member is assigned to.
    api<Event[]>('/events', { auth: true }).then(setRows).catch(() => setRows([])).finally(() => setBusy(false));
  }, [user]);

  if (loading || !user)
    return <div className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>;

  return (
    <DashboardShell user={user} nav={staffNav} title="Volunteer">
      <Panel title="My Assigned Events">
        <DataTable
          loading={busy}
          rows={rows}
          keyField={(e) => e.id}
          empty="You have no assigned events yet."
          columns={[
            { header: 'Event', cell: (e) => <span className="font-medium text-slate-800">{e.title}</span> },
            { header: 'Starts', cell: (e) => formatDateTime(e.startTime) },
            { header: 'Ends', cell: (e) => formatDateTime(e.endTime) },
            { header: 'Location', cell: (e) => e.location ?? '—' },
          ]}
        />
      </Panel>
    </DashboardShell>
  );
}
