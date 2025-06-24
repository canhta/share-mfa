'use client';

import { motion } from 'motion/react';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  overlay?: boolean;
}

export default function LoadingSpinner({ size = 'md', className = '', text, overlay = false }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  const Spinner = () => (
    <div
      className={cn(
        'flex flex-col items-center justify-center space-y-3',
        overlay && 'bg-white/80 backdrop-blur-sm rounded-xl p-6',
        className
      )}
    >
      <motion.div
        className={cn('border-2 border-gray-200 border-t-gray-600 rounded-full', sizes[size])}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.67, repeat: Infinity, ease: 'linear' }}
      />

      {text && (
        <motion.p
          className={cn('text-muted-foreground font-medium', textSizes[size])}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.13 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.13 }}
      >
        <Spinner />
      </motion.div>
    );
  }

  return <Spinner />;
}
