import { ReactNode } from 'react'

interface ModalActionsProps {
  children: ReactNode
}

export default function ModalActions({ children }: ModalActionsProps) {
  return (
    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200/60 dark:border-gray-600/30 mt-6">
      {children}
    </div>
  )
}

// Re-export Button for backward compatibility
export { default as Button } from './Button' 