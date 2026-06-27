'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Play, Tv } from 'lucide-react';

// 4 service cards — gradient tiles (light red -> deep red), matching Figma
const services = [
  {
    title: 'e-Hundi',
    desc: 'e-Hundi allows donations from people across the globe for the welfare of the temple. Devotees can offer donations via internet banking.',
    cta: 'Donate Now',
    href: '/donate',
    grad: 'from-red-50 to-red-200',
  },
  {
    title: 'Annadanam',
    desc: 'Offering one Annadanam is equal to donating 1000 elephants, a crore cows, gold and land that extends until one shore — fulfilling all duties of a family.',
    cta: 'Donate Now',
    href: '/donate',
    grad: 'from-red-200 to-red-400',
  },
  {
    title: 'Gosala',
    desc: 'During the Abhishekam of the deities in the temple and for other auspicious ceremonies, cow ghee and cow urine have great spiritual and purifying qualities.',
    cta: 'More Info',
    href: '/donate',
    grad: 'from-red-400 to-red-600',
  },
  {
    title: 'Sevas & Darshanam',
    desc: 'In a world filled with the essence of Jagajjanani, one can now wholeheartedly worship Sri Jagajjanani from anywhere in the world.',
    cta: 'Book Now',
    href: '/poojas',
    grad: 'from-red-600 to-maroon-700',
  },
];

const gallery = [
  // Mosaic spans apply only on sm+ ; mobile uses a clean uniform 2-col grid.
  { src: '/images/gopuram-dusk.jpg', span: 'sm:row-span-2' },
  { src: '/images/sanctum.jpg', span: '' },
  { src: '/images/temple-building.jpg', span: '' },
  { src: '/images/deity.png', span: '' },
  { src: '/images/lion.jpg', span: '' },
  { src: '/images/hero-banner.jpg', span: 'sm:col-span-2' },
];

const news = [
  'Brahmotsavam festival dates announced — nine days of grand celebrations.',
  'Online pooja booking is now live — receive an e-ticket with QR code.',
  'Jyeshta Purnima celebrations this month. Devotees welcome.',
];

export default function HomePage() {
  return (
    <>
      {/* ---------------- Hero (full-bleed banner image) ----------------
          On mobile the wide banner is shown whole (no side-cropping) so the
          deity + Telugu text stay visible; on desktop it fills edge to edge. */}
      <section className="relative bg-maroon-800">
        <Image
          src="/images/hero-banner.jpg"
          alt="ప్రపంచములోనే 2వ శ్రీ జగజ్జననీ దేవాలయము — నంద్యాల జిల్లా"
          width={1920}
          height={620}
          priority
          className="mx-auto h-auto w-full object-contain sm:h-[42vw] sm:max-h-[620px] sm:object-cover"
        />
      </section>

      {/* ---------------- Latest News ticker ---------------- */}
      <section className="bg-maroon-700 text-cream">
        <div className="section flex items-center gap-4 py-2.5">
          <span className="shrink-0 rounded-full bg-red-500 px-3 py-1 text-xs font-bold uppercase tracking-wide">
            Latest News
          </span>
          <div className="relative flex-1 overflow-hidden">
            <div className="flex w-max animate-marquee gap-12 whitespace-nowrap text-sm">
              {[...news, ...news].map((n, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="text-gold-light">✦</span> {n}
                </span>
              ))}
            </div>
          </div>
          <Link href="/news" className="hidden shrink-0 btn-gold px-4 py-1.5 text-sm sm:inline-flex">
            View All
          </Link>
        </div>
      </section>

      {/* ---------------- About ---------------- */}
      <section className="section relative py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">About</p>
            <h2 className="mt-1 font-serif text-3xl font-bold text-red-500 sm:text-4xl">
              Sri Jagajjanani Ammavaru
            </h2>
            <div className="mt-4 space-y-4 leading-relaxed text-ink/80">
              <p>
                Sri Jagajjanani of Nandyal is the creator of the universe, in the early days
                of creation of the all-pervading world. Ammavaru spontaneously gave a
                prominence in this world. In Inda, in the Himalayan mountains of Jammu and
                Kashmir, an altitude of 16,500 feet above sea level.
              </p>
              <p>
                From there, she became known throughout the world as the all-pervading divine
                force behind creation. Devotees seek Her grace, perform sacred poojas, and find
                peace in Her divine presence.
              </p>
            </div>
            <Link href="/about" className="btn-primary mt-6">
              Read More <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Deity line-art illustration */}
          <div className="flex justify-center lg:justify-end">
            <Image
              src="/images/deity-lineart.png"
              alt="Sri Jagajjanani Ammavaru"
              width={420}
              height={460}
              className="max-h-[420px] w-auto opacity-90"
            />
          </div>
        </div>
      </section>

      {/* ---------------- Service cards ---------------- */}
      <section className="section pb-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <div
              key={s.title}
              className={`flex flex-col rounded-xl2 bg-gradient-to-b ${s.grad} p-6 shadow-card`}
            >
              <h3 className="font-serif text-xl font-bold text-maroon-900">{s.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-maroon-900/80">{s.desc}</p>
              <Link href={s.href} className="btn-card mt-5 self-start">
                {s.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Jagajjanani TV ---------------- */}
      <section className="bg-gradient-to-br from-maroon-700 to-maroon-900 text-cream">
        <div className="section grid items-center gap-10 py-16 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream/10 ring-1 ring-gold/40">
                <Tv className="h-6 w-6 text-gold-light" />
              </span>
              <h2 className="font-serif text-3xl font-bold sm:text-4xl">Jagajjanani TV</h2>
            </div>
            <p className="mt-5 leading-relaxed text-cream/85">
              Jagajjanani TV is a 24×7 webcast devotional channel in Telugu which caters to the
              people of Hindu religion. It was launched on October 2022. It is from Sri
              Jagajjanani Devasthanam Product.
            </p>
            <p className="mt-3 text-sm text-cream/70">
              It&apos;s South India&apos;s first Sri Jagajjanani devotional channel in Telugu —
              telecasting fiction and non-fiction programs.
            </p>
            <Link href="/live" className="btn-gold mt-6">
              <Play className="h-4 w-4" /> Watch Now
            </Link>
          </div>
          <div className="aspect-video overflow-hidden rounded-xl2 bg-black/80 ring-1 ring-gold/20">
            <iframe
              src="https://www.youtube.com/embed/jfKfPfyJRdk"
              title="Jagajjanani TV"
              allow="encrypted-media"
              className="h-full w-full"
            />
          </div>
        </div>
      </section>

      {/* ---------------- Photo Gallery ---------------- */}
      <section className="section py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl font-bold text-red-500 sm:text-4xl">Photo Gallery</h2>
            <p className="mt-2 text-ink/60">The Beauty of Sacred Sri Jagajjanani Devasthanam</p>
          </div>
          <Link href="/news" className="hidden btn-outline px-4 py-2 text-sm sm:inline-flex">View All</Link>
        </div>
        <div className="grid auto-rows-[150px] grid-cols-2 gap-3 sm:grid-cols-4">
          {gallery.map((g, i) => (
            <div key={i} className={`group relative overflow-hidden rounded-xl shadow-card ${g.span}`}>
              <img src={g.src} alt="" loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Two CTA panels (Group 74 from Figma) ---------------- */}
      <section className="section pb-20">
        <div className="grid gap-6 sm:grid-cols-2">
          <CtaPanel
            title="Seva & Darshanam"
            href="/poojas"
            variant="cream"
            icon="/images/icon-homam-maroon.png"
            frame="/images/frame-red.png"
          />
          <CtaPanel
            title="Main Offerings"
            href="/donate"
            variant="red"
            icon="/images/icon-rings.png"
            frame="/images/frame-white.png"
          />
        </div>
      </section>
    </>
  );
}

function CtaPanel({
  title, href, variant, icon, frame,
}: {
  title: string; href: string; variant: 'cream' | 'red'; icon: string; frame: string;
}) {
  const isRed = variant === 'red';
  return (
    <div className={`relative overflow-hidden rounded-xl2 ${isRed ? 'bg-red-500' : 'bg-sand'}`}>
      {/* decorative meander border frame artwork */}
      <img src={frame} alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full object-fill p-1 opacity-90" />
      <div className="relative flex flex-col items-center px-8 py-12 text-center">
        <img src={icon} alt="" className="h-14 w-14 object-contain" />
        <h3 className={`mt-4 font-serif text-2xl font-bold ${isRed ? 'text-cream' : 'text-maroon-800'}`}>{title}</h3>
        <Link
          href={href}
          className={`mt-5 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold ${
            isRed ? 'bg-cream text-red-600 hover:bg-white' : 'bg-white text-red-600 hover:bg-red-50'
          }`}
        >
          View <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
