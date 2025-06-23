'use client'

import { motion } from 'motion/react'
import { forwardRef } from 'react'

import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
  children: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, onClick, ...props }, ref) => {
    const baseClasses = [
      'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900',
      'disabled:opacity-50 disabled:pointer-events-none',
      'relative overflow-hidden'
    ]

    const variants = {
      primary: [
        'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
        'text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40',
        'focus:ring-blue-500 border border-blue-600 hover:border-blue-700'
      ],
      secondary: [
        'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300',
        'dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700',
        'text-gray-900 dark:text-gray-100 shadow-sm',
        'focus:ring-gray-500 border border-gray-200 dark:border-gray-600'
      ],
      outline: [
        'border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
        'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50',
        'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100',
        'focus:ring-gray-500'
      ],
      ghost: [
        'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800/50',
        'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100',
        'focus:ring-gray-500'
      ],
      destructive: [
        'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
        'text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40',
        'focus:ring-red-500 border border-red-600 hover:border-red-700'
      ]
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm h-8',
      md: 'px-4 py-2 text-sm h-10',
      lg: 'px-6 py-3 text-base h-12',
      icon: 'h-10 w-10'
    }

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15, ease: 'easeInOut' }}
      >
        <button
          ref={ref}
          className={cn(
            baseClasses,
            variants[variant],
            sizes[size],
            className
          )}
          disabled={disabled || loading}
          onClick={onClick}
          {...props}
        >
          {/* Shimmer effect for primary buttons */}
          {variant === 'primary' && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />
          )}
          
          {loading ? (
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span>Loading...</span>
            </div>
          ) : (
            children
          )}
        </button>
      </motion.div>
    )
  }
)

Button.displayName = 'Button'

export default Button 