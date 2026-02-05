import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = 'https://simplythebest.wezzcoetzee.com';
const siteName = 'Simply The Best';
const siteDescription =
  'Crypto trading strategy backtester with exhaustive parameter optimization. Test SMA crossover strategies with leverage and ATR-based trailing stops.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    'crypto backtester',
    'trading strategy',
    'SMA crossover',
    'parameter optimization',
    'leverage trading',
    'ATR trailing stop',
    'cryptocurrency',
    'backtest',
  ],
  authors: [{ name: 'Wesley Coetzee' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName,
    title: siteName,
    description: siteDescription,
    images: [{ url: '/icon-512.png', width: 512, height: 512, alt: siteName }],
  },
  twitter: {
    card: 'summary',
    title: siteName,
    description: siteDescription,
    images: ['/icon-512.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: siteName,
  description: siteDescription,
  url: siteUrl,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
