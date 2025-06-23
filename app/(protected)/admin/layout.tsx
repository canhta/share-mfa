import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

import AdminLayout from '@/components/admin/AdminLayout'
import { createClient } from '@/utils/supabase/server'

interface AdminLayoutProps {
  children: ReactNode
}

/**
 * Admin Layout - Handles role-based authorization for admin routes
 * 
 * This layout is nested under the (protected) layout and ensures users
 * have admin role before accessing admin-only routes.
 * 
 * Follows Next.js 15 nested layouts pattern for scalable role-based access control.
 */
export default async function AdminLayoutComponent({ children }: AdminLayoutProps) {
  const supabase = await createClient()
  
  // User is already authenticated by parent (protected) layout
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    // This should not happen due to parent layout, but safety check
    redirect('/login')
  }

  // Check admin role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'admin') {
    // User is authenticated but not admin - redirect to dashboard
    redirect('/dashboard')
  }

  return (
    <AdminLayout user={user}>
      {children}
    </AdminLayout>
  )
}
