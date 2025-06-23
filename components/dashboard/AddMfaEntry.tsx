'use client'

import { useState } from 'react'

import Button from '@/components/ui/Button'
import FormInput from '@/components/ui/FormInput'
import FormTextarea from '@/components/ui/FormTextarea'
import Modal from '@/components/ui/Modal'
import ModalActions from '@/components/ui/ModalActions'
import { generateSecret, parseTOTPUri } from '@/lib/totp'
import type { MfaEntry } from '@/types/database'

interface AddMfaEntryProps {
  onEntryAdded: (entry: MfaEntry) => void
}

export default function AddMfaEntry({ onEntryAdded }: AddMfaEntryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    secret: '',
    notes: '',
    totpUri: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let secret = formData.secret
      let name = formData.name

      // If TOTP URI is provided, parse it
      if (formData.totpUri) {
        const parsed = parseTOTPUri(formData.totpUri)
        if (parsed) {
          secret = parsed.secret
          if (!name) name = parsed.name
        }
      }

      // If no secret, generate one
      if (!secret) {
        secret = generateSecret()
      }

      const response = await fetch('/api/mfa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name || 'Unnamed Entry',
          secret,
          notes: formData.notes,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        onEntryAdded(data.entry)
        setIsModalOpen(false)
        setFormData({ name: '', secret: '', notes: '', totpUri: '' })
      } else {
        console.error('Failed to create MFA entry')
      }
    } catch (error) {
      console.error('Error creating MFA entry:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="primary"
        className="btn-shimmer"
      >
        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add MFA Code
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add MFA Code"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            label="Name"
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Google Account"
          />

          <FormInput
            label="TOTP URI (from QR code)"
            id="totpUri"
            type="text"
            value={formData.totpUri}
            onChange={(e) => setFormData(prev => ({ ...prev, totpUri: e.target.value }))}
            placeholder="otpauth://totp/..."
          />

          <FormInput
            label="Secret (manual entry)"
            id="secret"
            type="text"
            value={formData.secret}
            onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
            placeholder="Leave blank to generate"
          />

          <FormTextarea
            label="Notes (optional)"
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            placeholder="Additional notes..."
          />

          <ModalActions>
            <Button onClick={() => setIsModalOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading} disabled={loading}>
              Create Code
            </Button>
          </ModalActions>
        </form>
      </Modal>
    </>
  )
} 