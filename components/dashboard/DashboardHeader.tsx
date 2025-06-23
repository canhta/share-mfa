'use client'

import type { User } from '@supabase/supabase-js'
import { BarChart3, CreditCard, Home, Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

import { InView } from '@/components/motion-primitives/in-view'
import { TextEffect } from '@/components/motion-primitives/text-effect'
import Button from '@/components/ui/Button'
interface DashboardHeaderProps {
  user: User
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Billing', href: '/billing', icon: CreditCard },
    { name: 'Pricing', href: '/pricing', icon: BarChart3 },
  ]

  const isActivePath = (path: string) => pathname === path

  return (
    <InView
      variants={{
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewOptions={{ once: true }}
    >
      <header className="glass-neutral border-b border-gray-200/40 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <TextEffect 
                  per="char" 
                  preset="slide"
                  className="text-2xl sm:text-3xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
                  speedReveal={1.5}
                >
                  ShareMFA
                </TextEffect>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const IconComponent = item.icon
                return (
                  <motion.div
                    key={item.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Link
                      href={item.href}
                      className={`inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActivePath(item.href)
                          ? 'bg-gray-100/80 text-gray-900 shadow-sm backdrop-blur-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  </motion.div>
                )
              })}
            </nav>
            
            {/* User Menu and Mobile Menu Button */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Desktop User Info */}
              <InView
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: { opacity: 1, scale: 1 }
                }}
                transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
                viewOptions={{ once: true }}
              >
                <div className="hidden md:flex items-center space-x-3 bg-gray-50/50 backdrop-blur-sm rounded-xl px-3 py-2">
                  <div className="flex-shrink-0">
                    <Image
                      className="h-8 w-8 rounded-full ring-2 ring-gray-200"
                      src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || 'User')}&background=404040&color=fff`}
                      alt={user.email || 'User avatar'}
                      width={32}
                      height={32}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {user.user_metadata?.full_name || user.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.email}
                    </p>
                  </div>
                </div>
              </InView>

              {/* Mobile menu button */}
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-gray-500 hover:bg-gray-100/80 focus-ring-neutral"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </motion.button>
              
              {/* Sign Out Button */}
              <InView
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: { opacity: 1, scale: 1 }
                }}
                transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
                viewOptions={{ once: true }}
              >
                <Button
                  onClick={handleSignOut}
                  variant="destructive"
                  size="sm"
                  className="rounded-xl"
                >
                  <span className="hidden sm:inline">Sign out</span>
                  <span className="sm:hidden">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                    </svg>
                  </span>
                </Button>
              </InView>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div 
                className="md:hidden border-t border-gray-200/40 pb-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="pt-4 space-y-1">
                  {/* Mobile User Info */}
                  <motion.div 
                    className="flex items-center px-3 py-3 mb-4 bg-gray-50/50 backdrop-blur-sm rounded-xl mx-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex-shrink-0">
                      <Image
                        className="h-8 w-8 rounded-full ring-2 ring-gray-200"
                        src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || 'User')}&background=404040&color=fff`}
                        alt={user.email || 'User avatar'}
                        width={32}
                        height={32}
                      />
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {user.user_metadata?.full_name || user.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.email}
                      </p>
                    </div>
                  </motion.div>

                  {/* Mobile Navigation Links */}
                  {navigation.map((item, index) => {
                    const IconComponent = item.icon
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + (index * 0.05) }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center mx-3 px-3 py-2.5 text-base font-medium rounded-xl transition-all duration-200 ${
                            isActivePath(item.href)
                              ? 'bg-gray-100/80 text-gray-900 shadow-sm backdrop-blur-sm'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
                          }`}
                        >
                          <IconComponent className="w-5 h-5 mr-3" />
                          {item.name}
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </InView>
  )
}
