'use client';

import { createContext, useContext } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth, AuthUser } from '@/lib/useAuth';
import { DashboardShell, NavItem } from './DashboardShell';

// Context so child pages can read the current user without re-fetching.
const UserContext = createContext<AuthUser | null>(null);
export const useConsoleUser = () => {
  const u = useContext(UserContext);
  if (!u) throw new Error('useConsoleUser must be used inside ConsoleLayout');
  return u;
};

// Renders auth guard + the dashboard shell ONCE (in the route-group layout).
// Child pages render inside <main> and swap without remounting the sidebar,
// so navigation is instant (no full-page reload/flash).
export function ConsoleLayout({
  allowed, nav, title, children,
}: {
  allowed: Array<AuthUser['role']>;
  nav: NavItem[];
  title: string;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth(allowed);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <UserContext.Provider value={user}>
      <DashboardShell user={user} nav={nav} title={title}>
        {children}
      </DashboardShell>
    </UserContext.Provider>
  );
}
