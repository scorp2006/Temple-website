'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LogIn } from 'lucide-react';
import { api, setToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login() {
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ token: string; user: { role: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(res.token);
      router.push(res.user.role === 'STAFF' ? '/staff' : '/admin');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="section flex min-h-[70vh] max-w-md items-center py-12">
      <div className="card w-full p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-temple-gradient text-cream">
            <LogIn className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-serif text-2xl font-bold text-maroon-700">Staff / Admin Login</h1>
          <p className="mt-1 text-sm text-maroon-800/60">Sign in to manage the temple platform.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@temple.org" />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
        </div>

        {error && <p className="mt-4 rounded-lg bg-kumkum/10 p-3 text-sm text-kumkum-dark">{error}</p>}

        <button onClick={login} disabled={busy} className="btn-primary mt-6 w-full disabled:opacity-50">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
        </button>

        <div className="mt-6 rounded-lg bg-sand p-3 text-xs text-maroon-800/70">
          <p className="font-semibold">Demo credentials (after seeding):</p>
          <p>Admin: admin@temple.org / password123</p>
          <p>Staff: staff@temple.org / password123</p>
        </div>
      </div>
    </div>
  );
}
