'use client';

import { useEffect, useState } from 'react';

import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { Panel } from '@/components/dashboard/DashboardShell';
import { DataTable } from '@/components/dashboard/Table';

interface Event { id: string; title: string; location?: string; startTime: string; endTime: string; }

export default function StaffEvents() {
  const [rows, setRows] = useState<Event[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    // Backend returns only the events this staff member is assigned to.
    api<Event[]>('/events', { auth: true }).then(setRows).catch(() => setRows([])).finally(() => setBusy(false));
  }, []);

  return (
    
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
    
  );
}
