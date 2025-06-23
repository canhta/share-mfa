'use client'

import { Activity, Eye, Plus, QrCode, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

import Card from '@/components/ui/Card'

interface UsageStats {
  total: {
    shares_generated: number
    shares_accessed: number
    mfa_entries_added: number
    qr_codes_scanned: number
  }
  last_30_days: {
    shares_generated: number
    shares_accessed: number
    mfa_entries_added: number
    qr_codes_scanned: number
  }
  last_7_days: {
    shares_generated: number
    shares_accessed: number
    mfa_entries_added: number
    qr_codes_scanned: number
  }
}

interface RecentActivity {
  action: string
  created_at: string
  metadata: Record<string, unknown>
}

interface UsageStatsProps {
  className?: string
}

export default function UsageStatsComponent({ className = '' }: UsageStatsProps) {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsageStats()
  }, [])

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/usage')
      if (!response.ok) {
        throw new Error('Failed to fetch usage statistics')
      }
      const data = await response.json()
      setStats(data.stats)
      setRecentActivity(data.recent_activity || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics')
    } finally {
      setIsLoading(false)
    }
  }

  const formatActionName = (action: string) => {
    switch (action) {
      case 'share_generated':
        return 'Share Created'
      case 'share_accessed':
        return 'Share Accessed'
      case 'mfa_added':
        return 'MFA Entry Added'
      case 'qr_scanned':
        return 'QR Code Scanned'
      default:
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    } else {
      return 'Just now'
    }
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-8 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <Card className="p-6">
          <div className="text-center text-red-600">
            <p>Failed to load usage statistics</p>
            <button 
              onClick={fetchUsageStats}
              className="mt-2 text-sm underline"
            >
              Try again
            </button>
          </div>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const statCards = [
    {
      label: 'Shares Created',
      value: stats.last_30_days.shares_generated,
      total: stats.total.shares_generated,
      icon: Plus,
      color: 'blue'
    },
    {
      label: 'Shares Accessed',
      value: stats.last_30_days.shares_accessed,
      total: stats.total.shares_accessed,
      icon: Eye,
      color: 'green'
    },
    {
      label: 'MFA Entries',
      value: stats.last_30_days.mfa_entries_added,
      total: stats.total.mfa_entries_added,
      icon: Activity,
      color: 'purple'
    },
    {
      label: 'QR Scans',
      value: stats.last_30_days.qr_codes_scanned,
      total: stats.total.qr_codes_scanned,
      icon: QrCode,
      color: 'orange'
    }
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Usage Overview */}
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Usage Overview</h3>
          <span className="ml-2 text-sm text-gray-500">(Last 30 days)</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const IconComponent = stat.icon
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-600',
              green: 'bg-green-100 text-green-600',
              purple: 'bg-purple-100 text-purple-600',
              orange: 'bg-orange-100 text-orange-600'
            }

            return (
              <div key={stat.label} className="text-center">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-2 ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-500">
                  {stat.total} total
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-900">
                    {formatActionName(activity.action)}
                  </span>
                  {activity.metadata && 
                   typeof activity.metadata === 'object' && 
                   'service_name' in activity.metadata && 
                   typeof activity.metadata.service_name === 'string' && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({activity.metadata.service_name})
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(activity.created_at)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
