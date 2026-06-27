'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, LogOut, Bell, ChevronDown, ExternalLink } from 'lucide-react';
import { AuthUser, logout } from '@/lib/useAuth';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

// Shared admin/volunteer console shell: fixed sidebar + topbar, neutral light
// theme, no public header/footer. Sidebar collapses to a drawer on mobile.
export function DashboardShell({
  user,
  nav,
  title,
  children,
}: {
  user: AuthUser;
  nav: NavItem[];
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-slate-900 text-slate-300 lg:flex">
        <SidebarContent user={user} nav={nav} pathname={pathname} title={title} />
      </aside>

      {/* Sidebar drawer (mobile) */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-slate-300 lg:hidden">
            <SidebarContent user={user} nav={nav} pathname={pathname} title={title} onNavigate={() => setOpen(false)} />
          </aside>
        </>
      )}

      {/* Main column */}
      <div className="lg:pl-60">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/" target="_blank" className="hidden items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 sm:flex">
              <ExternalLink className="h-4 w-4" /> View site
            </Link>
            <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium leading-none text-slate-800">{user.name}</p>
                <p className="text-xs capitalize text-slate-400">{user.role.toLowerCase()}</p>
              </div>
              <button onClick={() => logout(router)} className="ml-1 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600" aria-label="Logout" title="Logout">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  user, nav, pathname, title, onNavigate,
}: {
  user: AuthUser; nav: NavItem[]; pathname: string; title: string; onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-800 px-5">
        <Image src="/images/logo.png" alt="" width={36} height={36} className="h-9 w-9 object-contain" />
        <div className="leading-tight">
          <p className="text-sm font-bold text-white">Sri Jagajjanani</p>
          <p className="text-[10px] uppercase tracking-wide text-red-400">{title}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? 'bg-red-500 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 px-4 py-3 text-xs text-slate-500">
        Signed in as<br />
        <span className="text-slate-300">{user.email ?? user.name}</span>
      </div>
    </>
  );
}

// Reusable bits for console pages -------------------------------------------

export function StatCard({
  label, value, accent = 'indigo',
}: {
  label: string; value: string | number; accent?: 'indigo' | 'amber' | 'green' | 'red';
}) {
  const map = {
    indigo: 'bg-indigo-50 text-indigo-700',
    amber: 'bg-amber-50 text-amber-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
  } as const;
  return (
    <div className={`rounded-xl p-5 ${map[accent]}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm font-medium opacity-80">{label}</p>
    </div>
  );
}

export function Panel({ title, action, children }: { title?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          {title && <h2 className="font-semibold text-slate-800">{title}</h2>}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
