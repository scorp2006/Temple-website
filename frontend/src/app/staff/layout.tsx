'use client';

import { ConsoleLayout } from '@/components/dashboard/ConsoleLayout';
import { staffNav } from '@/components/dashboard/staffNav';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConsoleLayout allowed={['STAFF', 'ADMIN']} nav={staffNav} title="Volunteer">
      {children}
    </ConsoleLayout>
  );
}
