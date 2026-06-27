import { Info } from 'lucide-react';

// Small banner shown on dashboards while running in demo/preview mode.
export function DemoBanner() {
  return (
    <div className="mb-6 flex items-start gap-2 rounded-lg bg-gold/15 px-4 py-3 text-sm text-maroon-800 ring-1 ring-gold/40">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
      <span>
        <b>Preview mode.</b> This is a UI walkthrough with sample data — backend
        integration is in progress. Buttons show the intended flow.
      </span>
    </div>
  );
}
