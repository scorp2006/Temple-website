'use client';

import { useEffect, useState } from 'react';
import { Radio, Loader2, Play } from 'lucide-react';
import { api } from '@/lib/api';
import { SectionHeading } from '@/components/SectionHeading';

interface Stream {
  title: string;
  embedUrl: string | null;
  isVisible: boolean;
}

export default function LivePage() {
  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    api<Stream>('/livestream')
      .then(setStream)
      .catch(() => setStream(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="section max-w-4xl py-12">
      <SectionHeading title="Live Darshan" subtitle="Witness the divine darshan live from anywhere." />

      {loading && (
        <div className="flex items-center justify-center gap-2 py-20 text-maroon-700">
          <Loader2 className="h-6 w-6 animate-spin" /> Loading stream...
        </div>
      )}

      {!loading && (!stream || !stream.isVisible || !stream.embedUrl) && (
        <div className="rounded-2xl bg-sand p-12 text-center text-maroon-800/70">
          <Radio className="mx-auto h-12 w-12 text-maroon-400" />
          <p className="mt-4 font-semibold">The live stream is currently offline.</p>
          <p className="mt-1 text-sm">Please check back during darshan timings.</p>
        </div>
      )}

      {!loading && stream?.isVisible && stream.embedUrl && (
        <div className="card overflow-hidden">
          <div className="relative aspect-video bg-black">
            {playing ? (
              // Lazy-load the heavy iframe only after the user taps play (PRD perf req).
              <iframe
                src={`${stream.embedUrl}?autoplay=1`}
                title={stream.title}
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="h-full w-full"
              />
            ) : (
              <button
                onClick={() => setPlaying(true)}
                className="group flex h-full w-full items-center justify-center bg-temple-gradient"
              >
                <div className="text-center text-cream">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pasupu text-maroon-900 transition-transform group-hover:scale-110">
                    <Play className="h-10 w-10" fill="currentColor" />
                  </div>
                  <p className="mt-4 font-serif text-xl font-bold">{stream.title}</p>
                  <p className="mt-1 text-sm text-cream/80">Tap to watch live</p>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
