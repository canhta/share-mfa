'use client';

import { Building, Gift, Mail, Target, User } from 'lucide-react';
import { useState } from 'react';

import Button from '@/components/ui/Button';
import FormInput from '@/components/ui/FormInput';
import { OnboardingData } from '@/types/database';

interface ProfileSetupStepProps {
  onNext: (data: OnboardingData) => void;
  onBack: () => void;
  initialData?: Partial<OnboardingData>;
}

export default function ProfileSetupStep({ onNext, onBack, initialData = {} }: ProfileSetupStepProps) {
  const [formData, setFormData] = useState<OnboardingData>({
    displayName: initialData.displayName || '',
    company: initialData.company || '',
    useCase: initialData.useCase || 'personal',
    newsletterConsent: initialData.newsletterConsent ?? true,
    productUpdatesConsent: initialData.productUpdatesConsent ?? true,
    invitationCode: initialData.invitationCode || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      onNext(formData);
    } catch (error) {
      console.error('Profile setup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange =
    (field: keyof OnboardingData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;

      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
          <User className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Set up your profile</h2>
        <p className="text-gray-600">Help us personalize your experience</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Display Name */}
        <div>
          <div className="flex items-center mb-2">
            <User className="w-4 h-4 text-gray-400 mr-2" />
            <label className="text-sm font-medium text-gray-700">Display Name (Optional)</label>
          </div>
          <FormInput
            id="display-name"
            label="Display Name"
            placeholder="How should we address you?"
            value={formData.displayName || ''}
            onChange={handleInputChange('displayName')}
          />
        </div>

        {/* Company */}
        <div>
          <div className="flex items-center mb-2">
            <Building className="w-4 h-4 text-gray-400 mr-2" />
            <label className="text-sm font-medium text-gray-700">Company/Organization (Optional)</label>
          </div>
          <FormInput
            id="company"
            label="Company"
            placeholder="Your company or organization"
            value={formData.company || ''}
            onChange={handleInputChange('company')}
          />
        </div>

        {/* Use Case */}
        <div>
          <div className="flex items-center mb-2">
            <Target className="w-4 h-4 text-gray-400 mr-2" />
            <label className="text-sm font-medium text-gray-700">How will you use ShareMFA?</label>
          </div>
          <select
            value={formData.useCase || 'personal'}
            onChange={handleInputChange('useCase')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="personal">Personal use</option>
            <option value="business">Business use</option>
            <option value="team">Team collaboration</option>
          </select>
        </div>

        {/* Invitation Code */}
        <div>
          <div className="flex items-center mb-2">
            <Gift className="w-4 h-4 text-gray-400 mr-2" />
            <label className="text-sm font-medium text-gray-700">Invitation Code (Optional)</label>
          </div>
          <FormInput
            id="invitation-code"
            label="Invitation Code"
            placeholder="Enter invitation code if you have one"
            value={formData.invitationCode || ''}
            onChange={handleInputChange('invitationCode')}
          />
          <p className="mt-1 text-xs text-gray-500">
            Have an invitation code? Enter it here to earn rewards for your referrer!
          </p>
        </div>

        {/* Communication Preferences */}
        <div className="space-y-4">
          <div className="flex items-center mb-2">
            <Mail className="w-4 h-4 text-gray-400 mr-2" />
            <label className="text-sm font-medium text-gray-700">Communication Preferences</label>
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.productUpdatesConsent}
                onChange={handleInputChange('productUpdatesConsent')}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Product updates and security notifications</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.newsletterConsent}
                onChange={handleInputChange('newsletterConsent')}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Newsletter with tips and feature announcements</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-6">
          <Button type="button" variant="secondary" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
}
