'use client'

import { useCallback,useEffect, useState } from 'react'

import { generateTOTP, getTimeRemaining } from '@/lib/totp'

interface ShareViewProps {
  token: string
  embeddedPassword?: string
}

interface ShareEntry {
  id: string
  name: string
  secret: string
  notes: string | null
  created_at: string
}

export default function ShareView({ token, embeddedPassword }: ShareViewProps) {
  const [entry, setEntry] = useState<ShareEntry | null>(null)
  const [currentCode, setCurrentCode] = useState('------')
  const [timeRemaining, setTimeRemaining] = useState(30)
  const [password, setPassword] = useState(embeddedPassword || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [requiresPassword, setRequiresPassword] = useState(false)

  const validateAndLoad = useCallback(async (passwordToUse?: string) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/share/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shareToken: token,
          password: passwordToUse || password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setEntry(data.entry)
        setRequiresPassword(false)
      } else {
        if (response.status === 400 && data.error === 'Password is required') {
          setRequiresPassword(true)
        } else {
          setError(data.error || 'Failed to access shared entry')
        }
      }
         } catch {
       setError('Network error occurred')
     } finally {
      setLoading(false)
    }
  }, [token, password])

  // Auto-validate if embedded password is provided
  useEffect(() => {
    if (embeddedPassword) {
      validateAndLoad(embeddedPassword)
    } else {
      validateAndLoad()
    }
  }, [token, embeddedPassword, validateAndLoad])

  // Update TOTP codes and countdown timer
  useEffect(() => {
    if (!entry) return

    const updateCode = () => {
      setCurrentCode(generateTOTP(entry.secret))
      setTimeRemaining(getTimeRemaining())
    }

    updateCode() // Initial update
    const interval = setInterval(updateCode, 1000) // Update every second

    return () => clearInterval(interval)
  }, [entry])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    validateAndLoad()
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentCode)
      // You could add a toast notification here
         } catch (err) {
       console.error('Failed to copy code:', err)
     }
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-400 dark:text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Access Error</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  if (requiresPassword) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password Required
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Enter the password to access this MFA code"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Validating...' : 'Access MFA Code'}
          </button>
        </form>
      </div>
    )
  }

  if (loading || !entry) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-500"></div>
        </div>
      </div>
    )
  }

  const progressPercentage = (timeRemaining / 30) * 100

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{entry.name}</h2>
        {entry.notes && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{entry.notes}</p>
        )}
        
        <div 
          className="cursor-pointer bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 mb-4 group"
          onClick={copyCode}
          title="Click to copy"
        >
          <span className="text-3xl sm:text-4xl font-mono font-bold text-gray-900 dark:text-white tracking-wider group-hover:scale-105 transition-transform duration-200 inline-block">
            {currentCode}
          </span>
          <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-xs text-gray-500 dark:text-gray-400">Click to copy</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 mr-3">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${
                timeRemaining > 10 
                  ? 'bg-blue-600 dark:bg-blue-500' 
                  : timeRemaining > 5 
                  ? 'bg-yellow-500 dark:bg-yellow-400' 
                  : 'bg-red-500 dark:bg-red-400'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className={`text-sm font-mono font-medium ${
            timeRemaining > 10 
              ? 'text-gray-500 dark:text-gray-400' 
              : timeRemaining > 5 
              ? 'text-yellow-600 dark:text-yellow-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {timeRemaining}s
          </span>
        </div>
        
        <p className="text-xs text-gray-400 dark:text-gray-500">
          This code updates every 30 seconds. Click to copy.
        </p>
      </div>
    </div>
  )
} 