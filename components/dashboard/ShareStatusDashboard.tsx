'use client'

import { Calendar, Clock, ExternalLink, Eye, Link, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import CopyButton from '@/components/ui/CopyButton'

interface SharedLink {
  id: string
  mfa_entry_id: string
  token: string
  expires_at: string
  access_count: number
  max_access_count: number | null
  is_active: boolean
  service_name?: string
  created_at: string
}

interface ShareStatusDashboardProps {
  className?: string
}

export default function ShareStatusDashboard({ className = '' }: ShareStatusDashboardProps) {
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSharedLinks()
  }, [])

  const fetchSharedLinks = async () => {
    try {
      const response = await fetch('/api/share')
      if (!response.ok) {
        throw new Error('Failed to fetch shared links')
      }
      const data = await response.json()
      setSharedLinks(data.shared_links || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shared links')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this shared link?')) {
      return
    }

    try {
      const response = await fetch(`/api/share/${linkId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete shared link')
      }

      // Remove from local state
      setSharedLinks(prev => prev.filter(link => link.id !== linkId))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete shared link')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  const isAccessLimitReached = (link: SharedLink) => {
    return link.max_access_count !== null && link.access_count >= link.max_access_count
  }

  const getStatusBadge = (link: SharedLink) => {
    if (!link.is_active) {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Inactive</span>
    }
    if (isExpired(link.expires_at)) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Expired</span>
    }
    if (isAccessLimitReached(link)) {
      return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">Limit Reached</span>
    }
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>
  }

  const getShareUrl = (token: string) => {
    return `${window.location.origin}/share/${token}`
  }

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
            <p>Failed to load shared links</p>
            <button 
              onClick={fetchSharedLinks}
              className="mt-2 text-sm underline"
            >
              Try again
            </button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link className="w-5 h-5 mr-2 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Shared Links</h3>
          </div>
          <span className="text-sm text-gray-500">
            {sharedLinks.length} {sharedLinks.length === 1 ? 'link' : 'links'}
          </span>
        </div>

        {sharedLinks.length === 0 ? (
          <div className="text-center py-8">
            <Link className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">No shared links yet</p>
            <p className="text-sm text-gray-400">
              Create your first MFA entry and generate a sharing link to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sharedLinks.map((link) => (
              <div 
                key={link.id} 
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="font-medium text-gray-900 mr-3">
                        {link.service_name || `MFA Entry ${link.mfa_entry_id.slice(-8)}`}
                      </h4>
                      {getStatusBadge(link)}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        <span>
                          {link.access_count} 
                          {link.max_access_count && ` / ${link.max_access_count}`} 
                          {' '}access{link.access_count !== 1 ? 'es' : ''}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Expires {formatDate(link.expires_at)}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Created {formatDate(link.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <code className="flex-1 px-3 py-2 bg-gray-50 border rounded text-sm font-mono text-gray-700 overflow-hidden text-ellipsis">
                        {getShareUrl(link.token)}
                      </code>
                      <CopyButton 
                        text={getShareUrl(link.token)}
                        className="flex-shrink-0"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => window.open(getShareUrl(link.token), '_blank')}
                        className="flex-shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDeleteLink(link.id)}
                    className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
