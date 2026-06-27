'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

// Renders the public header/footer for site pages, but hides them on the
// admin/volunteer console routes (which have their own dashboard shell).
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isConsole =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/staff') ||
    pathname === '/login';

  if (isConsole) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
