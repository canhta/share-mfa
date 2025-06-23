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
  const [errors, setErrors] = useState({
    name: '',
    totpUri: '',
    general: '',
  })

  const resetForm = () => {
    setFormData({ name: '', secret: '', notes: '', totpUri: '' })
    setErrors({ name: '', totpUri: '', general: '' })
  }

  const validateForm = () => {
    const newErrors = { name: '', totpUri: '', general: '' }
    let isValid = true

    // If TOTP URI is provided, validate its format
    if (formData.totpUri.trim() && !formData.totpUri.startsWith('otpauth://totp/')) {
      newErrors.totpUri = 'TOTP URI must start with "otpauth://totp/"'
      isValid = false
    }

    // At least name should be provided, or a valid TOTP URI, or a secret
    const hasName = formData.name.trim()
    const hasValidTotpUri = formData.totpUri.trim() && formData.totpUri.startsWith('otpauth://totp/')
    const hasSecret = formData.secret.trim()

    if (!hasName && !hasValidTotpUri && !hasSecret) {
      newErrors.general = 'Please provide at least a name, a valid TOTP URI, or a secret'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

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
        } else {
          setErrors(prev => ({ ...prev, totpUri: 'Invalid TOTP URI format' }))
          setLoading(false)
          return
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
        handleCloseModal()
      } else {
        const errorData = await response.json()
        setErrors(prev => ({ ...prev, general: errorData.error || 'Failed to create MFA entry' }))
      }
    } catch (error) {
      console.error('Error creating MFA entry:', error)
      setErrors(prev => ({ ...prev, general: 'Network error occurred' }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="primary"
      >
        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add MFA Code
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add MFA Code"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.general && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-200">{errors.general}</p>
                </div>
              </div>
            </div>
          )}
          
          <FormInput
            label="Name"
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, name: e.target.value }))
              if (errors.general && e.target.value.trim()) {
                setErrors(prev => ({ ...prev, general: '' }))
              }
            }}
            placeholder="e.g., Google Account"
            error={errors.name}
          />

          <FormInput
            label="TOTP URI (from QR code)"
            id="totpUri"
            type="text"
            value={formData.totpUri}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, totpUri: e.target.value }))
              if (errors.totpUri) {
                setErrors(prev => ({ ...prev, totpUri: '' }))
              }
              if (errors.general && e.target.value.trim()) {
                setErrors(prev => ({ ...prev, general: '' }))
              }
            }}
            placeholder="otpauth://totp/..."
            error={errors.totpUri}
          />

          <FormInput
            label="Secret (manual entry)"
            id="secret"
            type="text"
            value={formData.secret}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, secret: e.target.value }))
              if (errors.general && e.target.value.trim()) {
                setErrors(prev => ({ ...prev, general: '' }))
              }
            }}
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
            <Button onClick={handleCloseModal} variant="secondary">
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