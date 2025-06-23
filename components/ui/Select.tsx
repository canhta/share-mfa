'use client'

import { AnimatePresence,motion } from 'motion/react'
import { SelectHTMLAttributes, useState } from 'react'

import { cn } from '@/lib/utils'

interface SelectOption {
  value: string | number
  label: string
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  label: string
  id: string
  value: string | number
  onChange: (value: string | number) => void
  options: SelectOption[]
  error?: string
}

export default function Select({ 
  label, 
  id, 
  value, 
  onChange, 
  options, 
  error, 
  className = '', 
  ...props 
}: SelectProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <motion.div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'block w-full px-4 py-3 text-gray-900 dark:text-white',
            'bg-white dark:bg-gray-900/50 backdrop-blur-sm',
            'border border-gray-300/60 dark:border-gray-600/30',
            'rounded-xl shadow-sm transition-all duration-200',
            'focus:ring-2 focus:ring-gray-400/20 focus:border-gray-500',
            'hover:border-gray-400/60 dark:hover:border-gray-500/40',
            'appearance-none cursor-pointer',
            error && 'border-gray-400 dark:border-gray-500/50 focus:border-gray-600 focus:ring-gray-500/20',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <motion.div 
          className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
          animate={{ rotate: isFocused ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
        
        {/* Focus indicator */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
                             className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-400/10 to-gray-500/10 pointer-events-none"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>
      </motion.div>
      
      <AnimatePresence>
        {error && (
          <motion.p 
            className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-1"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 