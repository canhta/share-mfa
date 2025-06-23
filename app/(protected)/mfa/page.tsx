'use client'

import { useRequireUser } from '@/components/auth'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import MfaManagement from '@/components/mfa/MfaManagement'
import { InView } from '@/components/motion-primitives/in-view'
import { TextEffect } from '@/components/motion-primitives/text-effect'
import { LoadingSpinner } from '@/components/ui'

/**
 * MFA Management Page - Dedicated page for managing MFA entries
 * 
 * Authentication is handled by the parent (protected) layout.
 * This page focuses on MFA entry management with enhanced UI.
 */
export default function MfaPage() {
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
      
      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
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
                className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2"
              >
                MFA Management
              </TextEffect>
              <TextEffect 
                per="word" 
                preset="fade-in-blur"
                delay={0.3}
                className="text-lg text-slate-600 max-w-2xl"
              >
                Manage your multi-factor authentication codes. Add, edit, and organize your 2FA tokens for secure sharing.
              </TextEffect>
            </div>
          </InView>

          {/* MFA Management Component */}
          <InView
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.95 },
              visible: { opacity: 1, y: 0, scale: 1 }
            }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            viewOptions={{ once: true }}
          >
            <MfaManagement />
          </InView>
        </div>
      </main>
    </div>
  )
}
