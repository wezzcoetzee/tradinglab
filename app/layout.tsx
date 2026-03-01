import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import './globals.css';
import Script from 'next/script';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = 'https://tradinglab.vip';
const siteName = 'TradingLab';
const siteDescription =
  'Free trading tools for position sizing, profit analysis, and strategy backtesting. Manage risk like a professional with live market data.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `Trading Tools & Risk Management | ${siteName}`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    'position size calculator',
    'profit calculator',
    'crypto backtester',
    'risk management',
    'trading tools',
    'risk reward ratio',
    'leverage trading',
  ],
  authors: [{ name: 'Wesley Coetzee' }],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName,
    title: `Trading Tools & Risk Management | ${siteName}`,
    description: siteDescription,
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: `${siteName} - Trading Tools & Risk Management`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Trading Tools & Risk Management | ${siteName}`,
    description: siteDescription,
    creator: '@wezzcoetzee',
    site: '@wezzcoetzee',
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
  '@graph': [
    {
      '@type': 'WebSite',
      name: siteName,
      url: siteUrl,
    },
    {
      '@type': 'WebApplication',
      name: siteName,
      description: siteDescription,
      url: siteUrl,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      author: {
        '@type': 'Person',
        name: 'Wesley Coetzee',
        url: 'https://wezzcoetzee.com',
      },
      datePublished: '2025-01-01',
      dateModified: new Date().toISOString().split('T')[0],
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
    {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
      logo: `${siteUrl}/icon-512.png`,
      sameAs: ['https://x.com/wezzcoetzee'],
    },
  ],
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
        <Script
          strategy="lazyOnload"
          src="https://www.googletagmanager.com/gtag/js?id=G-3ZVL91TDQG"
        />
        <Script strategy="lazyOnload" id="google-analytics">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-3ZVL91TDQG');
        `}
        </Script>
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
