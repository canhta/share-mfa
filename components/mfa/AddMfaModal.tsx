'use client'

import { useState } from 'react'

import { InView } from '@/components/motion-primitives/in-view'
import { TextEffect } from '@/components/motion-primitives/text-effect'
import { Button, FormInput, FormTextarea, Modal, StatusMessage } from '@/components/ui'

interface AddMfaModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: () => void
}

export default function AddMfaModal({ isOpen, onClose, onAdd }: AddMfaModalProps) {
  const [name, setName] = useState('')
  const [secret, setSecret] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!name.trim() || !secret.trim()) {
      setError('Name and secret are required')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/mfa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          secret: secret.trim(),
          notes: notes.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Error adding MFA entry:', data.error)
        // Handle specific error cases
        if (response.status === 401) {
          setError('You must be logged in to add MFA entries. Please refresh the page and try again.')
        } else if (response.status === 400) {
          setError(data.error || 'Invalid input. Please check your secret key format.')
        } else {
          setError('Failed to add MFA entry. Please try again.')
        }
        return
      }

      // Success - reset form and close modal
      setName('')
      setSecret('')
      setNotes('')
      setError('')
      onAdd()
    } catch (error) {
      console.error('Error adding MFA entry:', error)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setName('')
      setSecret('')
      setNotes('')
      setError('')
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add MFA Code" maxWidth="md">
      <InView
        variants={{
          hidden: { opacity: 0, scale: 0.95 },
          visible: { opacity: 1, scale: 1 }
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        viewOptions={{ once: true }}
      >
        <div className="space-y-6">
          {/* Description */}
          <TextEffect 
            per="word" 
            preset="fade-in-blur"
            className="text-sm text-slate-600 text-center"
          >
            Add a new multi-factor authentication code to your collection
          </TextEffect>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              id="mfa-name"
              label="Service Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Google, GitHub, AWS..."
              required
              disabled={isLoading}
            />

            <FormInput
              id="mfa-secret"
              label="Secret Key"
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter your TOTP secret key"
              required
              disabled={isLoading}
            />

            <FormTextarea
              id="mfa-notes"
              label="Notes (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this MFA code..."
              rows={3}
              disabled={isLoading}
            />

            {error && (
              <StatusMessage variant="error">
                {error}
              </StatusMessage>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                disabled={isLoading}
                className="flex-1 rounded-xl"
              >
                Add Code
              </Button>
            </div>
          </form>
        </div>
      </InView>
    </Modal>
  )
}
