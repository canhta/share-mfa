import { redirect } from 'next/navigation'

import DashboardHeader from '@/components/dashboard/DashboardHeader'
import MfaEntryList from '@/components/dashboard/MfaEntryList'
import { createClient } from '@/utils/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 bg-subtle-pattern">
      <DashboardHeader user={user} />
      
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
              Your MFA Codes
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage and share your multi-factor authentication codes securely
            </p>
          </div>
          <MfaEntryList />
        </div>
      </main>
    </div>
  )
} 