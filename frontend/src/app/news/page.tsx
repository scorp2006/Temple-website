'use client';

import { useEffect, useState } from 'react';
import { Loader2, Newspaper } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { SectionHeading } from '@/components/SectionHeading';

interface News {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  publishedAt: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<News[]>('/news')
      .then(setNews)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="section max-w-4xl py-12">
      <SectionHeading title="Temple News & Announcements" subtitle="Stay updated with festivals, events, and notices." />

      {loading && (
        <div className="flex items-center justify-center gap-2 py-20 text-maroon-700">
          <Loader2 className="h-6 w-6 animate-spin" /> Loading news...
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-kumkum/10 p-6 text-center text-kumkum-dark">{error}</div>
      )}

      {!loading && !error && news.length === 0 && (
        <p className="py-12 text-center text-maroon-800/60">No announcements yet.</p>
      )}

      <div className="space-y-6">
        {news.map((n) => (
          <article key={n.id} className="card p-6">
            <div className="flex items-center gap-2 text-sm text-kumkum">
              <Newspaper className="h-4 w-4" />
              <time>{formatDateTime(n.publishedAt)}</time>
            </div>
            <h3 className="mt-2 font-serif text-2xl font-bold text-maroon-700">{n.title}</h3>
            {n.imageUrl && (
              <img src={n.imageUrl} alt={n.title} loading="lazy" className="mt-4 max-h-72 w-full rounded-lg object-cover" />
            )}
            <p className="mt-3 whitespace-pre-line leading-relaxed text-maroon-900/80">{n.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
