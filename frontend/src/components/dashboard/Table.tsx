import { Loader2 } from 'lucide-react';

// Simple, consistent table for console list pages — with loading/empty states.
export function DataTable<T>({
  columns, rows, loading, empty = 'No records found.', keyField,
}: {
  columns: { header: string; cell: (row: T) => React.ReactNode; className?: string }[];
  rows: T[];
  loading?: boolean;
  empty?: string;
  keyField: (row: T) => string;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading…
      </div>
    );
  }
  if (rows.length === 0) {
    return <p className="py-16 text-center text-slate-400">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            {columns.map((c, i) => (
              <th key={i} className={`px-4 py-3 font-semibold ${c.className ?? ''}`}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={keyField(row)} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
              {columns.map((c, i) => (
                <td key={i} className={`px-4 py-3 ${c.className ?? ''}`}>{c.cell(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    CONFIRMED: 'bg-green-100 text-green-700',
    CHECKED_IN: 'bg-indigo-100 text-indigo-700',
    PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
    CANCELLED: 'bg-red-100 text-red-700',
    EXPIRED: 'bg-slate-100 text-slate-500',
    PAID: 'bg-green-100 text-green-700',
    CREATED: 'bg-amber-100 text-amber-700',
    FAILED: 'bg-red-100 text-red-700',
  };
  const cls = map[status] ?? 'bg-slate-100 text-slate-600';
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{status.replace('_', ' ')}</span>;
}
