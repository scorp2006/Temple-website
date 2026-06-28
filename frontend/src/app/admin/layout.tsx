'use client';

import { ConsoleLayout } from '@/components/dashboard/ConsoleLayout';
import { adminNav } from '@/components/dashboard/adminNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConsoleLayout allowed={['ADMIN']} nav={adminNav} title="Admin">
      {children}
    </ConsoleLayout>
  );
}
