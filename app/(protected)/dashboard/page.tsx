'use client';

import { useRequireUser } from '@/components/auth';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MfaEntrySummary from '@/components/dashboard/MfaEntrySummary';
import ShareStatusDashboard from '@/components/dashboard/ShareStatusDashboard';
import UsageStats from '@/components/dashboard/UsageStats';
import { InView } from '@/components/motion-primitives/in-view';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { LoadingSpinner } from '@/components/ui';

/**
 * Dashboard Page - Main user dashboard
 *
 * Authentication is handled by the parent (protected) layout.
 * This page focuses purely on rendering dashboard content.
 */
export default function DashboardPage() {
  const { user, loading } = useRequireUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-neutral bg-neutral-texture flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-neutral bg-neutral-texture">
      <DashboardHeader user={user!} />

      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Page Header */}
          <InView
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.33, ease: 'easeOut' }}
            viewOptions={{ once: true }}
          >
            <div className="text-center sm:text-left">
              <TextEffect per="word" preset="slide" className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                Dashboard
              </TextEffect>
              <TextEffect per="word" preset="fade-in-blur" delay={0.3} className="text-base text-slate-600">
                Manage your MFA codes, monitor usage, and track shared links
              </TextEffect>
            </div>
          </InView>

          {/* Stats Grid */}
          <InView
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.95 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.4, delay: 0.13, ease: 'easeOut' }}
            viewOptions={{ once: true }}
          >
            <UsageStats />
          </InView>

          {/* Two Column Layout for larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* MFA Entries - Takes up 2/3 on large screens */}
            <InView
              variants={{
                hidden: { opacity: 0, x: -30, scale: 0.95 },
                visible: { opacity: 1, x: 0, scale: 1 },
              }}
              transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
              viewOptions={{ once: true }}
            >
              <div className="lg:col-span-2">
                <MfaEntrySummary />
              </div>
            </InView>

            {/* Share Status - Takes up 1/3 on large screens */}
            <InView
              variants={{
                hidden: { opacity: 0, x: 30, scale: 0.95 },
                visible: { opacity: 1, x: 0, scale: 1 },
              }}
              transition={{ duration: 0.4, delay: 0.27, ease: 'easeOut' }}
              viewOptions={{ once: true }}
            >
              <div className="lg:col-span-1">
                <ShareStatusDashboard />
              </div>
            </InView>
          </div>
        </div>
      </main>
    </div>
  );
}
