import type { Metadata } from 'next';
import { Barlow } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/lib/i18n';
import { SiteChrome } from '@/components/SiteChrome';

// Barlow — used for section headings (e.g. "Photo Gallery") per the Figma design.
const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sri Jagajjanani Temple',
  description:
    'Official website of Sri Jagajjanani Temple — book poojas, accommodation, donate, and watch live darshan.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${barlow.variable} flex min-h-screen flex-col font-sans antialiased`}>
        <I18nProvider>
          <SiteChrome>{children}</SiteChrome>
        </I18nProvider>
      </body>
    </html>
  );
}
