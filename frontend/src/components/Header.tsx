'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  Menu, X, Tv, Search, UserCircle, Heart, LogOut, LayoutDashboard,
} from 'lucide-react';
import { useI18n, LANGS, Lang } from '@/lib/i18n';
import { api, getToken, clearToken } from '@/lib/api';

// Main nav — labels exactly as in the Figma navbar
const links = [
  { href: '/about', label: 'About' },
  { href: '/poojas', label: 'Sevas & Darshanam' },
  { href: '/donate', label: 'Donations' },
  { href: '/accommodation', label: 'Online Bookings' },
  { href: '/news', label: 'Media Room' },
  { href: '/about', label: 'Support' },
];

export function Header() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ role: string; name: string } | null>(null);
  const [now, setNow] = useState('');

  // Live date/time in the top utility bar
  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
      );
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  // Detect a logged-in account (for Sign in vs dashboard link)
  useEffect(() => {
    if (!getToken()) return;
    api<{ role: string; name: string }>('/auth/me', { auth: true })
      .then(setUser)
      .catch(() => clearToken());
  }, []);

  // Where a logged-in user's account link points (route by role)
  const dashHref = user?.role === 'ADMIN' ? '/admin' : user?.role === 'STAFF' ? '/staff' : '/';

  return (
    <header className="sticky top-0 z-50 bg-page shadow-card">
      {/* ---------- Top utility bar ---------- */}
      <div className="bg-red-500 text-cream">
        <div className="section flex items-center justify-between py-1.5 text-xs">
          <span className="hidden sm:block">{now}</span>
          <span className="sm:hidden">ॐ श्री जगज्जनन्यै नमः</span>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/live" className="flex items-center gap-1.5 hover:text-white">
              <Tv className="h-3.5 w-3.5" /> Jagajjanani TV
            </Link>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              className="hidden cursor-pointer bg-transparent uppercase outline-none [&>option]:text-ink sm:block"
              aria-label="Language"
            >
              {LANGS.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
            {user ? (
              <>
                <Link href={dashHref} className="flex items-center gap-1.5 hover:text-white">
                  <LayoutDashboard className="h-3.5 w-3.5" /> {user.role === 'ADMIN' ? 'Dashboard' : 'My Portal'}
                </Link>
                <button onClick={() => { clearToken(); setUser(null); }} className="flex items-center gap-1.5 hover:text-white">
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
              </>
            ) : (
              <Link href="/login" className="flex items-center gap-1.5 hover:text-white">
                <UserCircle className="h-3.5 w-3.5" /> Sign In / Sign Up
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Main nav row ---------- */}
      <div className="section flex items-center justify-between gap-4 py-3">
        {/* Logo + name */}
        <Link href="/" className="flex items-center gap-3">
          <Image src="/images/logo.png" alt="Sri Jagajjanani Ammavarla Devasthanam" width={52} height={52} className="h-12 w-12 shrink-0 object-contain" />
          <span className="font-serif text-sm font-bold leading-tight text-maroon-800 sm:text-[15px]">
            Sri Jagajjanani<br />Ammavarla<br />Devasthanam
          </span>
        </Link>

        {/* Center nav (desktop) */}
        <nav className="hidden items-center gap-1 xl:flex">
          {links.map((l, i) => (
            <Link key={i} href={l.href} className="rounded-md px-3 py-2 text-sm font-medium text-ink/80 hover:text-red-600">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-3">
          <Link href="/donate" className="hidden items-center gap-1.5 text-sm font-medium text-ink/80 hover:text-red-600 lg:flex">
            <Heart className="h-4 w-4" /> Volunteer
          </Link>
          <button className="hidden rounded-full p-1.5 text-ink/70 hover:text-red-600 lg:block" aria-label="Search">
            <Search className="h-5 w-5" />
          </button>
          <Link href="/donate" className="hidden btn-primary px-4 py-2 text-sm lg:inline-flex">Donate</Link>

          {/* Mobile toggle */}
          <button className="rounded-md p-2 text-maroon-700 hover:bg-red-50 xl:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* ---------- Mobile menu ---------- */}
      {open && (
        <nav className="flex flex-col gap-1 border-t border-red-50 bg-page px-4 pb-4 pt-2 xl:hidden">
          {links.map((l, i) => (
            <Link key={i} href={l.href} onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-base font-medium text-ink/80 hover:bg-red-50">
              {l.label}
            </Link>
          ))}
          <div className="my-1 temple-divider" />
          <Link href="/donate" onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-ink/80 hover:bg-red-50">Volunteer</Link>
          {user ? (
            <Link href={dashHref} onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-ink/80 hover:bg-red-50">
              {user.role === 'ADMIN' ? 'Admin Dashboard' : 'My Portal'}
            </Link>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)} className="rounded-md px-3 py-3 font-semibold text-red-600 hover:bg-red-50">Sign In / Sign Up</Link>
          )}
        </nav>
      )}
    </header>
  );
}
