'use client'

import { useState } from 'react'

import { AnimatedNumber } from '@/components/motion-primitives/animated-number'
import { GlowEffect } from '@/components/motion-primitives/glow-effect'
import { InView } from '@/components/motion-primitives/in-view'
import Card from '@/components/ui/Card'
import CopyButton from '@/components/ui/CopyButton'
import type { MfaEntry } from '@/types/database'

import ShareModal from './ShareModal'

interface MfaEntryCardProps {
  entry: MfaEntry
  currentCode: string
  timeRemaining: number
  onDelete: () => void
}

export default function MfaEntryCard({ entry, currentCode, timeRemaining, onDelete }: MfaEntryCardProps) {
  const [showShareModal, setShowShareModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this MFA entry?')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/mfa/${entry.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onDelete()
      } else {
        console.error('Failed to delete MFA entry')
      }
    } catch (error) {
      console.error('Error deleting MFA entry:', error)
    } finally {
      setIsDeleting(false)
    }
  }



  const progressPercentage = (timeRemaining / 30) * 100

  return (
    <>
      <InView
        variants={{
          hidden: { opacity: 0, y: 20, scale: 0.95 },
          visible: { opacity: 1, y: 0, scale: 1 }
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        viewOptions={{ once: true }}
      >
        <Card hover className="transition-all duration-200 relative overflow-hidden">
          <GlowEffect
            className="opacity-10"
            colors={timeRemaining > 10 ? ['#3B82F6'] : timeRemaining > 5 ? ['#F59E0B'] : ['#EF4444']}
            mode="static"
            blur="soft"
            duration={3}
          />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">{entry.name}</h3>
              <div className="flex space-x-1">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                  title="Share"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50"
                  title="Delete"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            {entry.notes && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{entry.notes}</p>
            )}
            
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4 group">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-gray-900 dark:text-white tracking-wider group-hover:scale-105 transition-transform duration-200 inline-block">
                    {currentCode}
                  </span>
                </div>
                <CopyButton text={currentCode} size="md" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    timeRemaining > 10 
                      ? 'bg-blue-600 dark:bg-blue-500' 
                      : timeRemaining > 5 
                      ? 'bg-yellow-500 dark:bg-yellow-400' 
                      : 'bg-red-500 dark:bg-red-400'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <AnimatedNumber 
                value={timeRemaining} 
                className={`text-sm font-mono font-medium ${
                  timeRemaining > 10 
                    ? 'text-gray-500 dark:text-gray-400' 
                    : timeRemaining > 5 
                    ? 'text-yellow-600 dark:text-yellow-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}
                springOptions={{ 
                  stiffness: 200, 
                  damping: 30 
                }}
              />
              <span className={`text-sm font-mono font-medium ml-1 ${
                timeRemaining > 10 
                  ? 'text-gray-500 dark:text-gray-400' 
                  : timeRemaining > 5 
                  ? 'text-yellow-600 dark:text-yellow-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>s</span>
            </div>
          </div>
        </Card>
      </InView>

      {showShareModal && (
        <ShareModal
          entry={entry}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  )
} 