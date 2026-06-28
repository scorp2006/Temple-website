'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, XCircle, ScanLine } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { Panel } from '@/components/dashboard/DashboardShell';

export default function StaffScan() {
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string; booking?: any } | null>(null);

  async function scan() {
    if (!token.trim()) return;
    setBusy(true); setResult(null);
    try {
      const res = await api<{ valid: boolean; booking: any }>('/bookings/scan', {
        method: 'POST', auth: true, body: JSON.stringify({ qrToken: token.trim() }),
      });
      setResult({ ok: true, msg: 'Valid ticket — checked in!', booking: res.booking });
    } catch (e) {
      setResult({ ok: false, msg: (e as Error).message });
    } finally { setBusy(false); setToken(''); }
  }

  return (
    
      <div className="max-w-xl">
        <Panel title="Scan / Verify Ticket">
          <p className="mb-4 text-sm text-slate-500">
            Enter or scan the QR token from the devotee&apos;s e-ticket. (In production, a camera scanner via html5-qrcode fills this automatically.)
          </p>
          <div className="flex gap-2">
            <input className="dash-input" placeholder="TKT_xxxxxxxx" value={token} onChange={(e) => setToken(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && scan()} />
            <button onClick={scan} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-5 text-sm font-semibold text-white disabled:opacity-50">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />} Verify
            </button>
          </div>

          {result && (
            <div className={`mt-5 flex items-start gap-3 rounded-xl p-4 ${result.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'}`}>
              {result.ok ? <CheckCircle2 className="h-6 w-6 shrink-0" /> : <XCircle className="h-6 w-6 shrink-0" />}
              <div>
                <p className="font-semibold">{result.msg}</p>
                {result.booking && (
                  <p className="mt-1 text-sm">{result.booking.devoteeName} · {result.booking.slot?.pooja?.name} · {result.booking.slot && formatDateTime(result.booking.slot.startTime)}</p>
                )}
              </div>
            </div>
          )}
        </Panel>
      </div>
    
  );
}
