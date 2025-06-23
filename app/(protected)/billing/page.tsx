'use client'

import { useRequireUser } from '@/components/auth'
import BillingDashboard from '@/components/dashboard/BillingDashboard'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { InView } from '@/components/motion-primitives/in-view'
import { TextEffect } from '@/components/motion-primitives/text-effect'
import { LoadingSpinner } from '@/components/ui'

/**
 * Billing Page - User billing and subscription management
 * 
 * Authentication is handled by the parent (protected) layout.
 * This page focuses purely on rendering billing content.
 */
export default function BillingPage() {
  const { user, loading } = useRequireUser()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-neutral bg-neutral-texture flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-neutral bg-neutral-texture">
      <DashboardHeader user={user!} />
      
      <main className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Page Header */}
          <InView
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            viewOptions={{ once: true }}
          >
            <div className="text-center sm:text-left">
              <TextEffect 
                per="word" 
                preset="slide"
                className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2"
              >
                Billing & Subscription
              </TextEffect>
              <TextEffect 
                per="word" 
                preset="fade-in-blur"
                delay={0.3}
                className="text-base text-slate-600"
              >
                Manage your subscription, view usage, and update billing information
              </TextEffect>
            </div>
          </InView>

          {/* Billing Dashboard */}
          <InView
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.95 },
              visible: { opacity: 1, y: 0, scale: 1 }
            }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            viewOptions={{ once: true }}
          >
            <BillingDashboard />
          </InView>
        </div>
      </main>
    </div>
  )
}
