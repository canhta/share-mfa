import { ReactNode } from 'react';

import Header from '@/components/ui/Header';

interface PublicLayoutProps {
  children: ReactNode;
}

/**
 * Public Layout - Layout for all public-facing pages
 *
 * This layout wraps all public pages (landing, pricing, login, share links)
 * and provides consistent header navigation and styling.
 *
 * Uses Next.js 15 nested layouts pattern for optimal performance.
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      <Header />
      <main className="pt-20">{children}</main>
    </>
  );
}
