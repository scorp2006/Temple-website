'use client';

import Image from 'next/image';
import { Clock, MapPin, Sparkles } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';

export default function AboutPage() {
  return (
    <div className="section py-12">
      <SectionHeading
        title="About the Temple"
        subtitle="The history, deity, and traditions of Sri Jagajjanani Temple"
      />

      <div className="card overflow-hidden">
        <Image
          src="/images/gopuram-dusk.jpg"
          alt="Temple gopuram"
          width={1400}
          height={500}
          className="h-64 w-full object-cover sm:h-96"
        />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="font-serif text-2xl font-bold text-maroon-700">Our History</h3>
          <p className="mt-4 leading-relaxed text-maroon-900/80">
            Sri Jagajjanani Temple stands as a beacon of devotion to the Divine Mother — the
            Jagajjanani, mother of the universe. Established by devout patrons and nurtured by
            generations of bhaktas, the temple has been a centre of worship, learning, and
            seva for the surrounding community.
          </p>
          <p className="mt-4 leading-relaxed text-maroon-900/80">
            The temple follows the rich Agama traditions of South India, with daily rituals,
            seasonal festivals, and the grand annual Brahmotsavam drawing thousands of pilgrims.
          </p>

          <h3 className="mt-8 font-serif text-2xl font-bold text-maroon-700">The Deity</h3>
          <p className="mt-4 leading-relaxed text-maroon-900/80">
            The presiding deity, Sri Jagajjanani, embodies the nurturing and protective aspect of
            the Supreme. Devotees offer kumkum, pasupu, and flowers, seeking Her blessings for
            health, prosperity, and spiritual growth.
          </p>
        </div>

        <aside className="space-y-4">
          <InfoCard icon={Clock} title="Darshan Timings">
            Mornings: 5:30 AM – 12:00 PM
            <br />
            Evenings: 4:00 PM – 8:30 PM
          </InfoCard>
          <InfoCard icon={Sparkles} title="Daily Sevas">
            Suprabhata Seva, Archana, Abhishekam, and special poojas on auspicious days.
          </InfoCard>
          <InfoCard icon={MapPin} title="Location">
            Temple Road, Andhra Pradesh, India
          </InfoCard>
        </aside>
      </div>

      {/* Map placeholder */}
      <div className="mt-10">
        <h3 className="mb-4 font-serif text-2xl font-bold text-maroon-700">Find Us</h3>
        <div className="flex h-64 items-center justify-center rounded-2xl bg-sand text-maroon-700/60 ring-1 ring-maroon-100">
          <div className="text-center">
            <MapPin className="mx-auto h-10 w-10" />
            <p className="mt-2 text-sm">Google Map embed goes here (admin-configurable)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-maroon-700">
        <Icon className="h-5 w-5 text-kumkum" />
        <h4 className="font-serif font-bold">{title}</h4>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-maroon-900/70">{children}</p>
    </div>
  );
}
