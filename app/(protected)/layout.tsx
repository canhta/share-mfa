import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

import { AuthProvider } from '@/components/auth/AuthProvider'
import { UserProvider } from '@/components/auth/UserProvider'
import { createClient } from '@/utils/supabase/server'

interface ProtectedLayoutProps {
  children: ReactNode
}

/**
 * Protected Layout - Handles authentication for all protected routes
 * 
 * This layout wraps all authenticated user routes (dashboard, billing, settings, etc.)
 * and ensures users are authenticated before accessing any child routes.
 * 
 * Uses Next.js 15 nested layouts pattern for optimal performance and maintainability.
 */
export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const supabase = await createClient()
  
  // Server-side authentication check
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    // Redirect unauthenticated users to login
    redirect('/login')
  }

  return (
    <AuthProvider>
      <UserProvider>
        <div className="min-h-screen bg-gradient-neutral bg-neutral-texture">
          {children}
        </div>
      </UserProvider>
    </AuthProvider>
  )
}
