'use client'

import type { User } from '@supabase/supabase-js'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { InView } from '@/components/motion-primitives/in-view'
import { TextEffect } from '@/components/motion-primitives/text-effect'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { createClient } from '@/utils/supabase/client'

interface DashboardHeaderProps {
  user: User
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <InView
      variants={{
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewOptions={{ once: true }}
    >
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <TextEffect 
                per="char" 
                preset="slide"
                className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white"
                speedReveal={1.5}
              >
                MFA Share
              </TextEffect>
            </div>
            
            <div className="flex items-center space-x-3 sm:space-x-4">
              <InView
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: { opacity: 1, scale: 1 }
                }}
                transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
                viewOptions={{ once: true }}
              >
                <ThemeToggle />
              </InView>
              
              <InView
                variants={{
                  hidden: { opacity: 0, x: 20 },
                  visible: { opacity: 1, x: 0 }
                }}
                transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                viewOptions={{ once: true }}
              >
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Image
                      className="h-8 w-8 rounded-full"
                      src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || 'User')}&background=3b82f6&color=fff`}
                      alt={user.email || 'User avatar'}
                      width={32}
                      height={32}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.user_metadata?.full_name || user.email}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </div>
              </InView>
              
              <InView
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: { opacity: 1, scale: 1 }
                }}
                transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
                viewOptions={{ once: true }}
              >
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 hover:scale-105"
                >
                  <span className="hidden sm:inline">Sign out</span>
                  <span className="sm:hidden">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </span>
                </button>
              </InView>
            </div>
          </div>
        </div>
      </header>
    </InView>
  )
} 