'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import CompletionStep from '@/components/onboarding/CompletionStep'
import OnboardingLayout from '@/components/onboarding/OnboardingLayout'
import ProfileSetupStep from '@/components/onboarding/ProfileSetupStep'
import WelcomeStep from '@/components/onboarding/WelcomeStep'
import { OnboardingData } from '@/types/database'

/**
 * Onboarding Page - New user onboarding flow
 * 
 * Authentication is handled by the parent (protected) layout.
 * This page focuses purely on onboarding logic and UI.
 */
export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already onboarded
    const checkOnboardingStatus = async () => {
      try {
        const response = await fetch('/api/onboarding')
        if (response.ok) {
          const data = await response.json()
          if (data.onboardingCompleted) {
            // User is already onboarded, redirect to dashboard
            router.push('/dashboard')
            return
          }
          // Pre-fill form with existing data if any
          if (data.profile) {
            setOnboardingData({
              displayName: data.profile.display_name || '',
              company: data.profile.company || '',
              useCase: data.profile.use_case || 'personal',
              newsletterConsent: data.profile.newsletter_consent ?? true,
              productUpdatesConsent: data.profile.product_updates_consent ?? true,
              invitationCode: data.profile.invitation_code || ''
            })
          }
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkOnboardingStatus()
  }, [router])

  const handleStepComplete = (stepData?: OnboardingData) => {
    if (stepData) {
      setOnboardingData(prev => ({ ...prev, ...stepData }))
    }
    setCurrentStep(prev => prev + 1)
  }

  const handleStepBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1))
  }

  const handleProfileSetup = async (profileData: OnboardingData) => {
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save profile')
      }

      // Save data locally and move to completion step
      setOnboardingData(prev => ({ ...prev, ...profileData }))
      setCurrentStep(3)
    } catch (error) {
      console.error('Profile setup error:', error)
      // You might want to show an error message to the user here
      alert('Failed to save profile. Please try again.')
    }
  }

  const handleOnboardingComplete = () => {
    // Redirect to dashboard
    router.push('/dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <WelcomeStep 
            onNext={handleStepComplete}
          />
        )
      case 2:
        return (
          <ProfileSetupStep
            onNext={handleProfileSetup}
            onBack={handleStepBack}
            initialData={onboardingData}
          />
        )
      case 3:
        return (
          <CompletionStep
            onComplete={handleOnboardingComplete}
            hasInvitationCode={!!onboardingData.invitationCode?.trim()}
          />
        )
      default:
        return null
    }
  }

  return (
    <OnboardingLayout 
      currentStep={currentStep}
      totalSteps={3}
    >
      {renderStep()}
    </OnboardingLayout>
  )
}
