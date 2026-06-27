'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getToken, clearToken } from './api';

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  role: 'ADMIN' | 'STAFF' | 'VISITOR';
}

// Guards a console page. Pass the role(s) allowed to view it.
// - no token / invalid token  -> redirect to /login
// - logged in but wrong role   -> redirect to their own home
// Returns { user, loading } so the page can show a spinner until resolved.
export function useAuth(allowed: Array<AuthUser['role']>) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    api<AuthUser>('/auth/me', { auth: true })
      .then((u) => {
        if (!allowed.includes(u.role)) {
          // Wrong role — send them where they belong.
          router.replace(u.role === 'ADMIN' ? '/admin' : u.role === 'STAFF' ? '/staff' : '/');
          return;
        }
        setUser(u);
      })
      .catch(() => {
        clearToken();
        router.replace('/login');
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, loading };
}

export function logout(router: ReturnType<typeof useRouter>) {
  clearToken();
  router.replace('/login');
}
