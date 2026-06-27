import Link from 'next/link';
import Image from 'next/image';
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
    <footer className="bg-page text-ink/80">
      {/* decorative scalloped top border */}
      <div className="temple-divider" />

      <div className="section grid grid-cols-2 gap-x-6 gap-y-8 py-10 sm:grid-cols-3 lg:grid-cols-6">
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="font-serif text-sm font-bold text-red-500">{col.title}</h4>
            <ul className="mt-3 space-y-2 text-sm">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-ink/70 hover:text-red-600">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* contact row */}
      <div className="section grid gap-4 border-t border-clay py-6 text-sm sm:grid-cols-3">
        <p className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <span>
            Sri Jagajjanani Ammavaru Devasthanam,<br />
            Sri Durga Friends Unit, Sri Jagajjanani Nagar, Kurnool, Nandyala, AP – 518501
          </span>
        </p>
        <p className="space-y-1">
          <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-red-500" /> srijagajjananitemple@gmail.com</span>
          <span className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-red-500" /> www.srijagajjananitemple.org</span>
        </p>
        <p className="space-y-1">
          <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-red-500" /> +91 99867 27123</span>
          <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-red-500" /> +91 99633 64670</span>
        </p>
      </div>

      {/* visitor counters */}
      <div className="section flex flex-wrap justify-center gap-8 border-t border-clay py-4 text-sm">
        <span className="flex items-center gap-2">Total Visitors <b className="rounded bg-maroon-700 px-2 py-0.5 text-cream">1,00,000</b></span>
        <span className="flex items-center gap-2">Today&apos;s Visitors <b className="rounded bg-maroon-700 px-2 py-0.5 text-cream">72</b></span>
      </div>

      {/* bottom bar */}
      <div className="bg-maroon-800 text-cream/80">
        <div className="section flex flex-col items-center justify-between gap-3 py-4 text-xs sm:flex-row">
          <div className="flex gap-3">
            <Facebook className="h-5 w-5 hover:text-gold-light" />
            <Instagram className="h-5 w-5 hover:text-gold-light" />
            <Youtube className="h-5 w-5 hover:text-gold-light" />
            <Twitter className="h-5 w-5 hover:text-gold-light" />
          </div>
          <p>© 2022 Jagajjanani Devasthanam · Privacy Policy · Terms & Conditions</p>
          <p className="text-cream/60">Developed by AJS Innovations</p>
        </div>
      </div>
    </footer>
  );
}
