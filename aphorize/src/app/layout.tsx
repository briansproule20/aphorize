import Header from '@/app/_components/header';
import { Providers } from '@/providers';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Aphorize',
  description: 'Find and create memorable quotes with AI, then turn them into beautiful posters',
  icons: {
    icon: '/aphorize-favicon.png',
    apple: '/aphorize-favicon.png',
  },
  openGraph: {
    title: 'Aphorize',
    description: 'Find and create memorable quotes with AI, then turn them into beautiful posters',
    images: ['/aphorize-favicon.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Aphorize',
    description: 'Find and create memorable quotes with AI, then turn them into beautiful posters',
    images: ['/aphorize-favicon.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex h-screen flex-col antialiased`}
      >
        <Providers>
          <Header title="Aphorize" />
          <div className="min-h-0 flex-1">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
