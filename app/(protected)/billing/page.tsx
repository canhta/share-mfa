import BillingDashboard from '@/components/dashboard/BillingDashboard'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { createClient } from '@/utils/supabase/server'

/**
 * Billing Page - User billing and subscription management
 * 
 * Authentication is handled by the parent (protected) layout.
 * This page focuses purely on rendering billing content.
 */
export default async function BillingPage() {
  const supabase = await createClient()
  
  // User is guaranteed to be authenticated by parent layout
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      <DashboardHeader user={user!} />
      
      <main className="max-w-4xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
              Billing & Subscription
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your subscription, view usage, and update billing information
            </p>
          </div>

          {/* Billing Dashboard */}
          <BillingDashboard />
        </div>
      </main>
    </>
  )
}
