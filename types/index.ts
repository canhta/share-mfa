// Essential types for components that haven't been fully migrated to Prisma types yet
// These will be gradually replaced with Prisma types

import type { mfa_entries } from '@prisma/client';

// Re-export Prisma types with legacy names for compatibility
export type MfaEntry = mfa_entries;

// Simple interfaces for data exchange
export interface OnboardingData {
  displayName?: string;
  company?: string;
  useCase?: 'personal' | 'business' | 'team';
  newsletterConsent?: boolean;
  productUpdatesConsent?: boolean;
  invitationCode?: string;
}

export interface ShareSettings {
  requirePassword: boolean;
  embedPasswordInLink: boolean;
  password?: string;
  expirationHours?: number;
}

export interface ShareResponse {
  shareToken: string;
  shareUrl: string;
}

export interface UsageStats {
  currentMonth: {
    sharesCount: number;
    maxShares: number | null;
    mfaEntriesCount: number;
  };
  canCreateShare: boolean;
  userTier: 'free' | 'pro' | 'enterprise';
}
