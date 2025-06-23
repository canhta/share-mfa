import DashboardHeader from '@/components/dashboard/DashboardHeader'
import MfaEntryList from '@/components/dashboard/MfaEntryList'
import ShareStatusDashboard from '@/components/dashboard/ShareStatusDashboard'
import UsageStats from '@/components/dashboard/UsageStats'
import { createClient } from '@/utils/supabase/server'

/**
 * Dashboard Page - Main user dashboard
 * 
 * Authentication is handled by the parent (protected) layout.
 * This page focuses purely on rendering dashboard content.
 */
export default async function DashboardPage() {
  const supabase = await createClient()
  
  // User is guaranteed to be authenticated by parent layout
  const { data: { user } } = await supabase.auth.getUser()
  
  return (
    <>
      <DashboardHeader user={user!} />
      
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
              Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your MFA codes, monitor usage, and track shared links
            </p>
          </div>

          {/* Stats Grid */}
          <UsageStats />

          {/* Two Column Layout for larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* MFA Entries - Takes up 2/3 on large screens */}
            <div className="lg:col-span-2">
              <MfaEntryList />
            </div>
            
            {/* Share Status - Takes up 1/3 on large screens */}
            <div className="lg:col-span-1">
              <ShareStatusDashboard />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
