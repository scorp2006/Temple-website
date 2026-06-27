import {
  LayoutDashboard, Ticket, Sparkles, BedDouble, HandCoins, CalendarDays, Users, Newspaper, Radio,
} from 'lucide-react';
import { NavItem } from './DashboardShell';

export const adminNav: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Bookings', icon: Ticket },
  { href: '/admin/poojas', label: 'Poojas & Slots', icon: Sparkles },
  { href: '/admin/accommodation', label: 'Accommodation', icon: BedDouble },
  { href: '/admin/donations', label: 'Donations', icon: HandCoins },
  { href: '/admin/events', label: 'Events', icon: CalendarDays },
  { href: '/admin/staff', label: 'Staff & Roles', icon: Users },
  { href: '/admin/news', label: 'News', icon: Newspaper },
  { href: '/admin/livestream', label: 'Live Stream', icon: Radio },
];
