import Link from 'next/link';
import { Facebook, Instagram, Youtube, Twitter, MapPin, Mail, Phone, Globe2 } from 'lucide-react';

const columns = [
  {
    title: 'About',
    links: [
      ['The Goddess', '/about'],
      ['The Temple', '/about'],
      ['The Mahatyam', '/about'],
      ['The Nirmaanam', '/about'],
    ],
  },
  {
    title: 'Sevas & Darshanam',
    links: [
      ['Overview', '/poojas'],
      ['Darshanam', '/poojas'],
      ['Seva', '/poojas'],
      ['Pooja', '/poojas'],
    ],
  },
  {
    title: 'Donations',
    links: [
      ['Overview', '/donate'],
      ['e-Hundi', '/donate'],
      ['AnnaPrasadam Trust', '/donate'],
      ['GoSamrakshana Trust', '/donate'],
    ],
  },
  {
    title: 'Online Booking',
    links: [
      ['Overview', '/poojas'],
      ['Seva Booking', '/poojas'],
      ['Darshanam Tickets', '/poojas'],
      ['Donations', '/donate'],
    ],
  },
  {
    title: 'Media Room',
    links: [
      ['Overview', '/news'],
      ['Media Kit', '/news'],
      ['Gallery', '/news'],
      ['Whats New', '/news'],
    ],
  },
  {
    title: 'Support',
    links: [
      ['Overview', '/about'],
      ['FAQs', '/about'],
      ['Connectivity to Pilgrims', '/about'],
      ['Contact Us', '/about'],
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-footer-bg text-footer-ink">
      {/* full-width mandala art band — tiles horizontally across the whole footer.
         The 525x58 source SVG has solid rule-lines baked into rows 0-15; the mandala
         scallop pattern lives in rows 16-57. We show only rows ~14-58 so the full
         scallop is visible (no art lost) but the harsh rule-lines are hidden, then
         fade it to the pale mauve used in the design.
         Native scale (no distortion): bg height 58px, band height 42px, offset
         -16px shows source rows 16-57 (the full scallop) with the rule-lines and
         no art cropped from the pattern. */}
      <div
        aria-hidden
        className="block w-full overflow-hidden opacity-[0.4]"
        style={{ height: '42px' }}
      >
        <div
          className="h-[58px] w-full bg-repeat-x"
          style={{
            backgroundImage: "url('/images/mandala-border.svg')",
            backgroundSize: 'auto 58px',
            backgroundPositionX: 'center',
            backgroundPositionY: '-16px',
          }}
        />
      </div>

      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10 xl:px-14">
        {/* 6 link columns — full width */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-9 py-12 sm:grid-cols-3 lg:grid-cols-6">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-serif text-[15px] font-bold text-footer-red">{col.title}</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-footer-ink/80 transition-colors hover:text-footer-red">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* contact row */}
        <div className="grid gap-5 border-t border-footer-ink/10 py-7 text-sm sm:grid-cols-3">
          <p className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-footer-red" />
            <span className="text-footer-ink/85">
              Sri Jagajjanani Ammavaru Devasthanam,<br />
              Sri Durga Friends Unit, Sri Jagajjanani Nagar, Kurnool, Nandyala, AP – 518501
            </span>
          </p>
          <div className="space-y-2 text-footer-ink/85">
            <span className="flex items-center gap-2.5"><Mail className="h-4 w-4 text-footer-red" /> srijagajjananitemple@gmail.com</span>
            <span className="flex items-center gap-2.5"><Globe2 className="h-4 w-4 text-footer-red" /> www.srijagajjananitemple.org</span>
          </div>
          <div className="space-y-2 text-footer-ink/85">
            <span className="flex items-center gap-2.5"><Phone className="h-4 w-4 text-footer-red" /> +91 99867 27123</span>
            <span className="flex items-center gap-2.5"><Phone className="h-4 w-4 text-footer-red" /> +91 99633 64670</span>
          </div>
        </div>

        {/* visitor counters */}
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 border-t border-footer-ink/10 py-5 text-sm text-footer-ink/85">
          <span className="flex items-center gap-2">Total Visitors <b className="rounded bg-footer-red px-2.5 py-0.5 font-semibold text-white">1,00,000</b></span>
          <span className="flex items-center gap-2">Today&apos;s Visitors <b className="rounded bg-footer-red px-2.5 py-0.5 font-semibold text-white">72</b></span>
        </div>
      </div>

      {/* bottom bar */}
      <div className="border-t border-footer-ink/10">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-footer-ink/70 sm:flex-row sm:px-6 lg:px-10 xl:px-14">
          <div className="flex gap-4 text-footer-ink/80">
            <Link href="#" aria-label="Facebook"><Facebook className="h-5 w-5 transition-colors hover:text-footer-red" /></Link>
            <Link href="#" aria-label="Instagram"><Instagram className="h-5 w-5 transition-colors hover:text-footer-red" /></Link>
            <Link href="#" aria-label="YouTube"><Youtube className="h-5 w-5 transition-colors hover:text-footer-red" /></Link>
            <Link href="#" aria-label="Twitter"><Twitter className="h-5 w-5 transition-colors hover:text-footer-red" /></Link>
          </div>
          <p className="text-center">© 2022 Jagajjanani Devasthanam · Privacy Policy · Terms &amp; Conditions</p>
          <p className="text-footer-ink/60">Developed by AJS Innovations</p>
        </div>
      </div>
    </footer>
  );
}
