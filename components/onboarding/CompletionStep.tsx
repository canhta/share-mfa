'use client'

import { ArrowRight, CheckCircle, Gift, Rocket } from 'lucide-react'
import { useState } from 'react'

import Button from '@/components/ui/Button'

interface CompletionStepProps {
  onComplete: () => void
  hasInvitationCode?: boolean
}

export default function CompletionStep({ 
  onComplete, 
  hasInvitationCode = false 
}: CompletionStepProps) {
  const [isCompleting, setIsCompleting] = useState(false)

  const handleComplete = async () => {
    setIsCompleting(true)
    
    try {
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500))
      onComplete()
    } catch (error) {
      console.error('Completion error:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-6">
        <CheckCircle className="w-8 h-8 text-white" />
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Welcome to ShareMFA! 🎉
      </h2>
      
      <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
        Your account is now set up and ready to use. Let&apos;s get you started with sharing your MFA codes securely.
      </p>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mb-4">
            <Rocket className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Quick Setup</h3>
          <p className="text-sm text-gray-600">
            Add your first MFA entry and start sharing codes instantly
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Secure Sharing</h3>
          <p className="text-sm text-gray-600">
            Generate time-limited links with configurable access controls
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg mb-4">
            <Gift className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Free Credits</h3>
          <p className="text-sm text-gray-600">
            {hasInvitationCode 
              ? 'Bonus credits earned from your invitation code!' 
              : 'Start with free sharing credits, earn more by referring friends'
            }
          </p>
        </div>
      </div>

      {hasInvitationCode && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200 mb-6">
          <div className="flex items-center justify-center text-purple-700 mb-2">
            <Gift className="w-5 h-5 mr-2" />
            <span className="font-medium">Invitation Code Bonus!</span>
          </div>
          <p className="text-sm text-purple-600">
            Thanks for using an invitation code! Your referrer will receive bonus credits, 
            and you&apos;ll get extra credits too once our referral program launches.
          </p>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">What&apos;s next?</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center">
            <ArrowRight className="w-4 h-4 mr-3 text-blue-500" />
            <span>Add your first MFA entry (authenticator app or manual entry)</span>
          </div>
          <div className="flex items-center">
            <ArrowRight className="w-4 h-4 mr-3 text-blue-500" />
            <span>Generate a secure sharing link for emergency access</span>
          </div>
          <div className="flex items-center">
            <ArrowRight className="w-4 h-4 mr-3 text-blue-500" />
            <span>Explore advanced sharing options and analytics</span>
          </div>
        </div>
      </div>

      <Button
        onClick={handleComplete}
        disabled={isCompleting}
        className="w-full md:w-auto px-8 py-3 text-lg"
      >
        {isCompleting ? 'Finishing setup...' : 'Go to Dashboard'}
        {!isCompleting && <ArrowRight className="w-5 h-5 ml-2" />}
      </Button>
    </div>
  )
}
