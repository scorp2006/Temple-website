'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { formatINR } from '@/lib/format';
import { SectionHeading } from '@/components/SectionHeading';

interface Pooja {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  isSpecial: boolean;
  imageUrl?: string;
}

const fallbackImg =
  '/images/sanctum.jpg';

export default function PoojasPage() {
  const [poojas, setPoojas] = useState<Pooja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Pooja[]>('/poojas')
      .then(setPoojas)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const regular = poojas.filter((p) => !p.isSpecial);
  const special = poojas.filter((p) => p.isSpecial);

  return (
    <div className="section py-12">
      <SectionHeading
        title="Book a Pooja"
        subtitle="Select a pooja and choose your preferred time slot. You will receive an e-ticket with a QR code."
      />

      {loading && (
        <div className="flex items-center justify-center gap-2 py-20 text-maroon-700">
          <Loader2 className="h-6 w-6 animate-spin" /> Loading poojas...
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-kumkum/10 p-6 text-center text-kumkum-dark ring-1 ring-kumkum/30">
          <p className="font-semibold">Could not load poojas.</p>
          <p className="mt-1 text-sm">{error}</p>
          <p className="mt-2 text-sm text-maroon-800/70">
            Make sure the backend API is running on <code>localhost:4000</code>.
          </p>
        </div>
      )}

      {!loading && !error && (
        <>
          {special.length > 0 && (
            <section className="mb-12">
              <h3 className="mb-4 flex items-center gap-2 font-serif text-2xl font-bold text-maroon-700">
                <Sparkles className="h-6 w-6 text-pasupu" /> Special Poojas
              </h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {special.map((p) => (
                  <PoojaCard key={p.id} pooja={p} special />
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="mb-4 font-serif text-2xl font-bold text-maroon-700">Daily Poojas & Sevas</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {regular.map((p) => (
                <PoojaCard key={p.id} pooja={p} />
              ))}
            </div>
            {regular.length === 0 && special.length === 0 && (
              <p className="py-12 text-center text-maroon-800/60">
                No poojas have been configured yet. (Admin can add them in the dashboard.)
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function PoojaCard({ pooja, special }: { pooja: Pooja; special?: boolean }) {
  return (
    <Link href={`/poojas/${pooja.id}`} className="card group flex flex-col transition-transform hover:-translate-y-1">
      <div className="relative h-44 overflow-hidden">
        <img
          src={pooja.imageUrl || fallbackImg}
          alt={pooja.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        {special && (
          <span className="absolute right-3 top-3 rounded-full bg-pasupu px-3 py-1 text-xs font-bold text-maroon-900">
            Special
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h4 className="font-serif text-lg font-bold text-maroon-700">{pooja.name}</h4>
        {pooja.description && (
          <p className="mt-1 line-clamp-2 text-sm text-maroon-900/60">{pooja.description}</p>
        )}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-kumkum-dark">{formatINR(pooja.basePrice)}</span>
          <span className="flex items-center gap-1 text-sm font-semibold text-maroon-600 group-hover:gap-2">
            Book <ArrowRight className="h-4 w-4 transition-all" />
          </span>
        </div>
      </div>
    </Link>
  );
}
