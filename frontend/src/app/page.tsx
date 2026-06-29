'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Play, Tv } from 'lucide-react';

// 4 service cards: four solid colours forming a peach -> deep-red gradient
// across the row (per the Figma "About" section). The first (lightest) card uses
// dark text + a maroon icon; the other three use white text + white icons.
const services = [
  {
    title: 'e-Hundi',
    desc: 'e-Hundi allows donations from people across the globe for the welfare of the sacred Sri Jagajjanani Ammavarla Devasthanam. Devotees can offer their donations via internet banking.',
    cta: 'Donate Now',
    href: '/donate',
    icon: '/images/svc-ehundi.svg',
    bg: '#FFE6DE',
    dark: true, // dark text + maroon icon on the light card
  },
  {
    title: 'Annadhanam',
    desc: 'Offering one Annadhanam is equals to donating 1000 elephants, a crore cows, gold and land that extends until seashore; fulfilling all duties of a family.',
    cta: 'Donate Now',
    href: '/donate',
    icon: '/images/svc-annadanam.svg',
    bg: '#FF7045',
    dark: false,
  },
  {
    title: 'Goshala',
    desc: 'During the Abhishek of the deities in the temple and for other auspicious ceremonies, the shastras have enjoined the use of cow dung and cow urine, as their spiritual, medical and purifying qualities are greatly beneficial.',
    cta: 'More Info',
    href: '/donate',
    icon: '/images/svc-goshala.svg',
    bg: '#E43535',
    dark: false,
  },
  {
    title: 'Sevas & Darshanam',
    desc: 'In a world, that’s filled with the essence of Jagajjanani, one can now wholeheartedly worship Sri Jagajjanani from anywhere in the world.',
    cta: 'Book Now',
    href: '/poojas',
    icon: '/images/svc-seva.svg',
    bg: '#B21A1A',
    dark: false,
  },
];

const gallery = [
  // Mosaic spans apply only on sm+ ; mobile uses a clean uniform 2-col grid.
  // Layout (per Figma): tall image on the left, a 2x2 cluster, plus a tall image
  // on the right. The old hero-banner tile was removed (it duplicated the hero).
  { src: '/images/gopuram-dusk.jpg', span: 'sm:row-span-2' },
  { src: '/images/sanctum.jpg', span: '' },
  { src: '/images/temple-building.jpg', span: '' },
  { src: '/images/gallery-7.png', span: 'sm:row-span-2' },
  { src: '/images/gallery-8.png', span: '' },
  { src: '/images/gallery-9.png', span: '' },
];

export default function HomePage() {
  return (
    <>
      {/* ---------------- Hero (full-bleed banner image) ----------------
          On mobile the wide banner is shown whole (no side-cropping) so the
          deity + Telugu text stay visible; on desktop it fills edge to edge. */}
      <section className="relative bg-maroon-800 dark:bg-night-950">
        <Image
          src="/images/hero-banner.jpg"
          alt="ప్రపంచములోనే 2వ శ్రీ జగజ్జననీ దేవాలయము, నంద్యాల జిల్లా"
          width={1920}
          height={620}
          priority
          className="mx-auto h-auto w-full object-contain dark:opacity-95 sm:h-[34vw] sm:max-h-[540px] sm:object-cover"
        />
        {/* dark-mode warm vignette + gold glow over the hero */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden dark:block"
          style={{
            background:
              'radial-gradient(120% 80% at 50% 30%, rgba(0,0,0,0) 45%, rgba(14,10,6,0.55) 100%), linear-gradient(180deg, rgba(14,10,6,0.35) 0%, rgba(14,10,6,0) 25%, rgba(14,10,6,0.6) 100%)',
          }}
        />
      </section>

      {/* ---------------- Temple News bar ---------------- */}
      <section className="border-b border-red-100 bg-page dark:border-transparent dark:bg-night-900">
        <div className="section flex items-center gap-5 py-3">
          <span className="flex shrink-0 items-center gap-5 font-barlow text-base font-medium text-ink/80 dark:text-sacredgold-light">
            Temple News
            <span className="h-6 w-px bg-red-200 dark:bg-sacredgold/30" aria-hidden />
          </span>
          <p className="flex-1 truncate text-sm text-red-600 dark:text-parchment/80 sm:text-[15px]">
            Welcome to Sri Jagajjanani Ammavarala Devasthanam. Please use this portal to know about
            temple and book tickets for sevas and darshanam.
          </p>
          <Link
            href="/news"
            className="hidden shrink-0 items-center gap-1.5 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 dark:gold-fill dark:hover:opacity-90 sm:inline-flex"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ---------------- About + service cards ----------------
          One shared padded container so the About block and the 4-card row align
          and neither sticks to the screen edges. */}
      <section className="relative bg-page pb-16 dark:bg-night-900">
        <div className="relative mx-auto w-full max-w-[1500px] px-6 sm:px-10 lg:px-16">
          {/* About: text on the left, goddess + lion line-art on the right */}
          <div className="grid items-center gap-10 pt-16 lg:grid-cols-2">
            <div>
              <p className="font-barlow text-lg font-semibold text-red-500 dark:text-sacredgold">About</p>
              <h2 className="mt-1 font-barlow text-3xl font-semibold text-red-600 dark:gold-text sm:text-[2.6rem] sm:leading-tight">
                Sri Jagajjanani Ammavaru
              </h2>
              <div className="mt-5 max-w-xl space-y-5 font-barlow leading-relaxed text-ink/80 dark:text-parchment/85">
                <p>
                  Sri Jagajjanani of Nandyal is the creator of the universe. In the early days of
                  creation, Ammavaru manifested herself in the Himalayan mountains of Jammu and
                  Kashmir, India, at an altitude of 19,500 feet above sea level. From there, she
                  became known throughout the world as the all-pervading divine force behind creation.
                </p>
                <p className="text-sm text-ink/70 dark:text-parchment/65">
                  Lake Manasarovar was located close to the temple. Our mythological texts and Vedas
                  state that all three deities bathed in this lake during Brahma Muhurta and visited
                  the Goddess.
                </p>
              </div>
              <Link
                href="/about"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 dark:gold-fill dark:hover:opacity-90"
              >
                Read More <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* goddess + lion line-art illustration */}
            <div className="flex justify-center lg:justify-end">
              <img
                src="/images/about-goddess-lion.png"
                alt="Sri Jagajjanani Ammavaru with the divine lion"
                className="h-auto w-full max-w-[460px] object-contain dark:opacity-90 dark:[filter:invert(1)]"
              />
            </div>
          </div>

          {/* 4 service cards: aligned with the About block above, with rounded
              corners. peach -> deep-red across the row; descriptions line-clamped
              so the cards stay compact and even. */}
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <div
                key={s.title}
                className="group flex flex-col items-center rounded-2xl px-6 py-8 text-center [background-color:var(--card-bg)] dark:!bg-transparent dark:glass-dark"
                style={{ ['--card-bg' as string]: s.bg }}
              >
                {/* icon: original art in light mode, metallic-gold masked in dark */}
                <img
                  src={s.icon}
                  alt=""
                  aria-hidden
                  className="h-12 w-12 object-contain dark:hidden"
                />
                <span
                  aria-hidden
                  className="gold-art hidden h-12 w-12 dark:block"
                  style={{ WebkitMaskImage: `url(${s.icon})`, maskImage: `url(${s.icon})` }}
                />
                <h3
                  className={`mt-3 font-barlow text-lg font-semibold dark:gold-text ${
                    s.dark ? 'text-maroon-900' : 'text-white'
                  }`}
                >
                  {s.title}
                </h3>
                <p
                  className={`mt-2 line-clamp-4 text-[12.5px] leading-relaxed dark:!text-parchment/70 ${
                    s.dark ? 'text-maroon-900/80' : 'text-white/90'
                  }`}
                >
                  {s.desc}
                </p>
                <Link
                  href={s.href}
                  className={`mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-sm font-semibold dark:gold-fill dark:hover:opacity-90 ${
                    s.dark ? 'text-maroon-900' : 'text-red-600'
                  }`}
                >
                  {s.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Jagajjanani TV ----------------
          Deep-maroon section with a frosted glass card (#8A0000 @ ~10%) holding the
          channel info + live player, and a faint bg-less mandala on each side. */}
      <section
        className="relative overflow-hidden rounded-b-[60px] text-white
          [background:linear-gradient(180deg,#FFF7EC_0%,#FFF1E8_12%,rgba(221,100,20,0.62)_38%,rgba(182,12,15,0.95)_100%)]
          dark:[background:linear-gradient(180deg,#0D0B09_0%,#2A0C08_50%,#4A0A0A_100%)]"
      >
        {/* bg-less white mandalas, one on each side (transparent PNG): larger,
            pushed outward and slightly down. */}
        <img
          src="/images/mandala-deco.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -left-32 top-[58%] hidden w-[26rem] -translate-y-1/2 opacity-90 lg:block"
        />
        <img
          src="/images/mandala-deco.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -right-32 top-[58%] hidden w-[26rem] -translate-y-1/2 opacity-90 lg:block"
        />

        <div className="section relative z-10 py-16">
          {/* frosted glass card */}
          <div
            className="grid items-center gap-10 rounded-[28px] border border-white/15 p-8 shadow-2xl backdrop-blur-xl dark:border-transparent sm:p-10 lg:grid-cols-2 lg:p-12"
            style={{
              backgroundColor: 'rgba(138, 0, 0, 0.04)',
              backgroundImage:
                'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 38%, rgba(255,255,255,0) 70%)',
            }}
          >
            <div>
              <div className="flex items-center gap-3">
                <Image
                  src="/images/logo.png"
                  alt="Sri Jagajjanani Ammavarla Devasthanam"
                  width={48}
                  height={48}
                  className="h-12 w-12 shrink-0 object-contain"
                />
                <h2 className="font-barlow text-3xl font-semibold dark:gold-text sm:text-4xl">Jagajjanani TV</h2>
              </div>
              <p className="mt-5 leading-relaxed text-white">
                Jagajjanani TV is a 24×7 webcast devotional channel in Telugu which caters to the
                people of Hindu religion. It was launched on October 2022. It is from Sri
                Jagajjanani Devasthanam Product.
              </p>
              <p className="mt-3 text-sm text-white">
                It&apos;s South India&apos;s first Sri Jagajjanani devotional channel in Telugu,
                telecasting fiction and non-fiction programs.
              </p>
              <Link
                href="/live"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-50 dark:gold-fill dark:hover:opacity-90"
              >
                <Play className="h-4 w-4" /> Watch Now
              </Link>
            </div>
            <div className="flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-black/80 ring-1 ring-white/15">
              <p className="px-6 text-center text-sm text-white/70">The video is not available</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Gallery + CTA section ----------------
          Pure-white background with faint mandala flowers in the corners and a
          warm linear-gradient band at the very bottom that sits above the footer. */}
      <div className="relative overflow-hidden bg-page dark:bg-night-900">
        {/* decorative bg-less mandala flowers (per Figma placement):
            one bottom-left near the two-card block, one on the right sitting
            just BELOW the gallery images (beside the two-card block). */}
        <img
          src="/images/flower-mandala.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -left-20 bottom-44 hidden w-48 opacity-50 dark:opacity-30 dark:[filter:brightness(0)_invert(1)] xl:block"
        />
        <img
          src="/images/flower-mandala.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -right-16 top-[46%] hidden w-52 opacity-50 dark:opacity-30 dark:[filter:brightness(0)_invert(1)] xl:block"
        />

        {/* Photo Gallery */}
        <section className="relative z-10 mx-auto w-full max-w-[1500px] px-6 pt-16 sm:px-10 lg:px-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-barlow text-3xl font-semibold text-red-500 dark:gold-text sm:text-4xl">Photo Gallery</h2>
              <p className="mt-1.5 font-barlow text-ink/60 dark:text-parchment/60">The Beauty of Sacred Sri Jagajjanani Devasthanam</p>
            </div>
            <Link
              href="/news"
              className="hidden items-center gap-1.5 rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600 dark:gold-fill dark:hover:opacity-90 sm:inline-flex"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid auto-rows-[150px] grid-cols-2 gap-3 sm:grid-cols-4">
            {gallery.map((g, i) => (
              <div key={i} className={`group relative overflow-hidden rounded-xl shadow-card dark:shadow-none ${g.span}`}>
                <img src={g.src} alt="" loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              </div>
            ))}
          </div>
        </section>

        {/* Two CTA cards (Group 74 from Figma).
            Mobile: simple stacked cards. sm+: one wide meander frame wrapping both,
            with the cards inset to sit inside the frame's drawn border. */}
        <section className="relative z-10 mx-auto w-full max-w-[980px] px-5 pb-20 pt-14 sm:px-8 sm:pb-24">
          {/* Mobile (no outer frame): two stacked cards */}
          <div className="grid grid-cols-1 gap-5 sm:hidden">
            <div className="h-56">
              <CtaCard title="Seva & Darshanam" href="/poojas" variant="cream" icon="/images/icon-homam-line.png" />
            </div>
            <div className="h-56">
              <CtaCard title="Main Offerings" href="/donate" variant="red" icon="/images/icon-rings-line.png" />
            </div>
          </div>

          {/* sm+ : framed two-up layout */}
          <div className="relative hidden w-full sm:block" style={{ aspectRatio: '1093 / 362' }}>
            <img
              src="/images/cards-outer-frame.svg"
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 h-full w-full p-[0.8%] dark:[filter:sepia(1)_saturate(450%)_hue-rotate(5deg)_brightness(1.15)]"
            />
            <div
              className="absolute grid grid-cols-2 gap-6"
              style={{ top: '16%', bottom: '16%', left: '13%', right: '13%' }}
            >
              <CtaCard title="Seva & Darshanam" href="/poojas" variant="cream" icon="/images/icon-homam-line.png" />
              <CtaCard title="Main Offerings" href="/donate" variant="red" icon="/images/icon-rings-line.png" />
            </div>
          </div>
        </section>

      </div>
    </>
  );
}

function CtaCard({
  title, href, variant, icon,
}: {
  title: string; href: string; variant: 'cream' | 'red'; icon: string;
}) {
  const isRed = variant === 'red';
  // The light inner frame goes on the dark (red) card; the dark inner frame
  // goes on the light (cream) card.
  const innerFrame = isRed ? '/images/card-inner-light.svg' : '/images/card-inner-dark.svg';
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl [background-color:var(--cta-bg)] dark:!bg-transparent dark:glass-dark"
      style={{ ['--cta-bg' as string]: isRed ? '#B21A1A' : '#FFE1B8' }}
    >
      {/* per-card inner meander border. Light mode keeps the per-variant frame.
          Dark mode uses the SAME source frame on both cards (card-inner-light.svg)
          so the gold filter renders identically on both. */}
      <img
        src={innerFrame}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-fill p-[3%] dark:hidden"
      />
      <img
        src="/images/card-inner-light.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden h-full w-full object-fill p-[3%] dark:block dark:[filter:sepia(1)_saturate(450%)_hue-rotate(5deg)_brightness(1.15)] dark:opacity-90"
      />
      <div className="relative flex flex-col items-center px-6 text-center">
        <img
          src={icon}
          alt=""
          className={`h-12 w-12 object-contain sm:h-14 sm:w-14 dark:[filter:brightness(0)_invert(1)_sepia(1)_saturate(320%)_hue-rotate(2deg)] ${isRed ? '' : 'brightness-0 opacity-80'}`}
        />
        <h3 className={`mt-3 font-barlow text-lg font-semibold dark:gold-text sm:text-2xl ${isRed ? 'text-white' : 'text-maroon-800'}`}>
          {title}
        </h3>
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-50 dark:gold-fill dark:hover:opacity-90"
        >
          View <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
