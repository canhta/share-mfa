'use client'

import { Check } from 'lucide-react'
import { ReactNode } from 'react'

interface OnboardingLayoutProps {
  children: ReactNode
  currentStep: number
  totalSteps: number
}

const steps = [
  { id: 1, name: 'Welcome', description: 'Get started' },
  { id: 2, name: 'Profile', description: 'Setup your account' },
  { id: 3, name: 'Complete', description: 'All done!' }
]

export default function OnboardingLayout({ 
  children, 
  currentStep, 
  totalSteps = 3 
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome to ShareMFA</h1>
            <p className="text-gray-600 mt-2">Let&apos;s get your account set up</p>
          </div>

          {/* Progress Steps */}
          <nav aria-label="Progress">
            <ol className="flex items-center justify-center space-x-4 sm:space-x-8">
              {steps.map((step) => (
                <li key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                        step.id < currentStep
                          ? 'bg-blue-600 border-blue-600'
                          : step.id === currentStep
                          ? 'border-blue-600 bg-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {step.id < currentStep ? (
                        <Check className="h-4 w-4 text-white" />
                      ) : (
                        <span
                          className={`text-sm font-medium ${
                            step.id === currentStep
                              ? 'text-blue-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {step.id}
                        </span>
                      )}
                    </div>
                    <div className="ml-3 hidden sm:block">
                      <p
                        className={`text-sm font-medium ${
                          step.id <= currentStep ? 'text-blue-600' : 'text-gray-500'
                        }`}
                      >
                        {step.name}
                      </p>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                  </div>
                  {step.id < totalSteps && (
                    <div
                      className={`ml-4 h-px w-8 sm:w-16 ${
                        step.id < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <a href="/support" className="text-blue-600 hover:text-blue-500">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
