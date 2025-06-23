'use client'

import { useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'

import { useAuth } from './AuthProvider'

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
  requireAuth?: boolean
  loadingComponent?: ReactNode
}

const DefaultLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </div>
    </div>
  </div>
)

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/login',
  requireAuth = true,
  loadingComponent = <DefaultLoading />
}: ProtectedRouteProps) {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, requireAuth, router, redirectTo])

  if (loading) {
    return <>{loadingComponent}</>
  }

  if (requireAuth && !user) {
    // Component will unmount due to redirect, but return null just in case
    return null
  }

  return <>{children}</>
}
