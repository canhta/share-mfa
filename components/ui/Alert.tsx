'use client';

import { motion } from 'motion/react';
import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface AlertProps {
  children: ReactNode;
  variant?: 'default' | 'destructive' | 'warning' | 'success';
  className?: string;
  onClose?: () => void;
}

export default function Alert({ children, variant = 'default', className = '', onClose }: AlertProps) {
  const variants = {
    default: ['bg-gray-50/80 backdrop-blur-sm', 'border border-gray-200/60', 'text-gray-900'],
    destructive: ['bg-gray-100/80 backdrop-blur-sm', 'border border-gray-300/60', 'text-gray-800'],
    warning: ['bg-gray-50/80 backdrop-blur-sm', 'border border-gray-200/60', 'text-gray-900'],
    success: ['bg-gray-50/80 backdrop-blur-sm', 'border border-gray-200/60', 'text-gray-900'],
  };

  return (
    <motion.div
      className={cn('p-4 rounded-xl shadow-sm', 'animate-fade-up', variants[variant], className)}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">{children}</div>

        {onClose && (
          <motion.button
            onClick={onClose}
            className="ml-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100/60 rounded-lg transition-all duration-150"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
