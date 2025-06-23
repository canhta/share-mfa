import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '' 
}: BadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  }

  const variantClasses = {
    default: 'bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 border border-gray-200/60 dark:border-gray-600/30',
    primary: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200/60 dark:border-blue-600/30',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200/60 dark:border-green-600/30',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200/60 dark:border-yellow-600/30',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200/60 dark:border-red-600/30',
    info: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200 border border-cyan-200/60 dark:border-cyan-600/30'
  }

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
} 