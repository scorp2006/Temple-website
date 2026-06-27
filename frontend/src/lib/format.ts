// Prices are stored in paise (₹1 = 100 paise) on the backend.
export function formatINR(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export function formatDateTime(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatTime(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}
