'use client';

import Link from 'next/link';
import { ScanLine, TicketPlus, CalendarDays } from 'lucide-react';
import { useConsoleUser } from '@/components/dashboard/ConsoleLayout';

export default function StaffHome() {
  const user = useConsoleUser();

  const actions = [
    { href: '/staff/scan', icon: ScanLine, title: 'Scan Ticket', desc: 'Verify a devotee’s QR e-ticket at the venue' },
    { href: '/staff/spot', icon: TicketPlus, title: 'Spot Booking', desc: 'Create & print a ticket for a walk-in devotee' },
    { href: '/staff/events', icon: CalendarDays, title: 'My Events', desc: 'See the events you’re assigned to' },
  ];

  return (
    
      <div className="space-y-6">
        <div>
          <h2 className="mb-1 text-xl font-semibold text-slate-800">Namaste, {user.name.split(' ')[0]} 🙏</h2>
          <p className="text-sm text-slate-500">What would you like to do?</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {actions.map((a) => (
            <Link key={a.href} href={a.href} className="group rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-600 group-hover:bg-red-500 group-hover:text-white">
                <a.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-semibold text-slate-800">{a.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{a.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    
  );
}
