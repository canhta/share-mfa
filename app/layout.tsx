import './globals.css';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { ScrollProgress } from '@/components/motion-primitives/scroll-progress';
import Footer from '@/components/ui/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MFA Share - Secure TOTP Code Sharing',
  description:
    'Securely share your TOTP-based multi-factor authentication codes with trusted friends and family members.',
  keywords: ['MFA', 'TOTP', 'authentication', 'security', 'sharing', 'two-factor'],
};

/**
 * Root Layout - Global layout for the entire application
 *
 * Provides base HTML structure and global styles.
 * Authentication context is provided by nested layouts where needed.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <ScrollProgress className="fixed top-0 z-50" />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
