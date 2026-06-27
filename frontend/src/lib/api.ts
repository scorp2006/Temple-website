// Thin client for the Express backend. Centralises the base URL, auth token,
// and JSON handling so pages stay clean.

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('temple_token');
}

export function setToken(token: string) {
  localStorage.setItem('temple_token', token);
}

export function clearToken() {
  localStorage.removeItem('temple_token');
}

interface ApiOptions extends RequestInit {
  auth?: boolean;
}

export async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string>),
  };
  if (opts.auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...opts, headers, cache: 'no-store' });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(data?.error ?? `Request failed (${res.status})`);
  }
  return data as T;
}
