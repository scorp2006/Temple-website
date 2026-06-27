import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Sri Jagajjanani Temple',
  description:
    'Official website of Sri Jagajjanani Temple — book poojas, accommodation, donate, and watch live darshan.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <I18nProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
