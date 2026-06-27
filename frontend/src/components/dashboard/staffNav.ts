import { LayoutDashboard, ScanLine, TicketPlus, CalendarDays } from 'lucide-react';
import { NavItem } from './DashboardShell';

export const staffNav: NavItem[] = [
  { href: '/staff', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/staff/scan', label: 'Scan Ticket', icon: ScanLine },
  { href: '/staff/spot', label: 'Spot Booking', icon: TicketPlus },
  { href: '/staff/events', label: 'My Events', icon: CalendarDays },
];
