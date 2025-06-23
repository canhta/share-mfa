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
    default: 'bg-gray-100 text-gray-800 border border-gray-200/60',
    primary: 'bg-blue-100 text-blue-800 border border-blue-200/60',
    success: 'bg-green-100 text-green-800 border border-green-200/60',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200/60',
    error: 'bg-red-100 text-red-800 border border-red-200/60',
    info: 'bg-cyan-100 text-cyan-800 border border-cyan-200/60'
  }

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
} 