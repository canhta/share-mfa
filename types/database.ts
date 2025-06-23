export interface Database {
  public: {
    Tables: {
      mfa_entries: {
        Row: {
          id: string
          user_id: string
          name: string
          secret: string
          notes: string | null
          share_password: string | null
          share_token: string | null
          require_password: boolean
          embed_password_in_link: boolean
          token_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          secret: string
          notes?: string | null
          share_password?: string | null
          share_token?: string | null
          require_password?: boolean
          embed_password_in_link?: boolean
          token_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          secret?: string
          notes?: string | null
          share_password?: string | null
          share_token?: string | null
          require_password?: boolean
          embed_password_in_link?: boolean
          token_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_tier: 'free' | 'pro' | 'enterprise'
          display_name: string | null
          company: string | null
          use_case: 'personal' | 'business' | 'team' | null
          newsletter_consent: boolean
          product_updates_consent: boolean
          onboarding_completed: boolean
          profile_setup_completed: boolean
          stripe_customer_id: string | null
          subscription_id: string | null
          subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing' | null
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          available_credits: number
          total_credits_earned: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_tier?: 'free' | 'pro' | 'enterprise'
          display_name?: string | null
          company?: string | null
          use_case?: 'personal' | 'business' | 'team' | null
          newsletter_consent?: boolean
          product_updates_consent?: boolean
          onboarding_completed?: boolean
          profile_setup_completed?: boolean
          stripe_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'trialing' | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          available_credits?: number
          total_credits_earned?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_tier?: 'free' | 'pro' | 'enterprise'
          display_name?: string | null
          company?: string | null
          use_case?: 'personal' | 'business' | 'team' | null
          newsletter_consent?: boolean
          product_updates_consent?: boolean
          onboarding_completed?: boolean
          profile_setup_completed?: boolean
          stripe_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'trialing' | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          available_credits?: number
          total_credits_earned?: number
          created_at?: string
          updated_at?: string
        }
      }
      shared_links: {
        Row: {
          id: string
          mfa_entry_id: string
          share_token: string
          status: 'active' | 'revoked'
          require_password: boolean
          share_password: string | null
          embed_password_in_link: boolean
          expires_at: string | null
          created_by: string
          click_count: number
          last_accessed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mfa_entry_id: string
          share_token: string
          status?: 'active' | 'revoked'
          require_password?: boolean
          share_password?: string | null
          embed_password_in_link?: boolean
          expires_at?: string | null
          created_by: string
          click_count?: number
          last_accessed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mfa_entry_id?: string
          share_token?: string
          status?: 'active' | 'revoked'
          require_password?: boolean
          share_password?: string | null
          embed_password_in_link?: boolean
          expires_at?: string | null
          created_by?: string
          click_count?: number
          last_accessed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          month: string
          shares_count: number
          mfa_entries_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month: string
          shares_count?: number
          mfa_entries_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month?: string
          shares_count?: number
          mfa_entries_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          email: string
          name: string | null
          company: string | null
          tier_interest: 'pro' | 'enterprise' | 'newsletter'
          message: string | null
          status: 'new' | 'contacted' | 'converted'
          source: string | null
          referrer_url: string | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          company?: string | null
          tier_interest: 'pro' | 'enterprise' | 'newsletter'
          message?: string | null
          status?: 'new' | 'contacted' | 'converted'
          source?: string | null
          referrer_url?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          company?: string | null
          tier_interest?: 'pro' | 'enterprise' | 'newsletter'
          message?: string | null
          status?: 'new' | 'contacted' | 'converted'
          source?: string | null
          referrer_url?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      billing_events: {
        Row: {
          id: string
          user_id: string
          stripe_event_id: string | null
          event_type: string
          subscription_id: string | null
          customer_id: string | null
          amount: number | null
          currency: string | null
          status: 'pending' | 'succeeded' | 'failed' | 'canceled'
          metadata: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_event_id?: string | null
          event_type: string
          subscription_id?: string | null
          customer_id?: string | null
          amount?: number | null
          currency?: string | null
          status: 'pending' | 'succeeded' | 'failed' | 'canceled'
          metadata?: Record<string, unknown> | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_event_id?: string | null
          event_type?: string
          subscription_id?: string | null
          customer_id?: string | null
          amount?: number | null
          currency?: string | null
          status?: 'pending' | 'succeeded' | 'failed' | 'canceled'
          metadata?: Record<string, unknown> | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type MfaEntry = Database['public']['Tables']['mfa_entries']['Row']
export type MfaEntryInsert = Database['public']['Tables']['mfa_entries']['Insert']
export type MfaEntryUpdate = Database['public']['Tables']['mfa_entries']['Update']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type SharedLink = Database['public']['Tables']['shared_links']['Row']
export type SharedLinkInsert = Database['public']['Tables']['shared_links']['Insert']
export type SharedLinkUpdate = Database['public']['Tables']['shared_links']['Update']

export type UsageTracking = Database['public']['Tables']['usage_tracking']['Row']
export type UsageTrackingInsert = Database['public']['Tables']['usage_tracking']['Insert']
export type UsageTrackingUpdate = Database['public']['Tables']['usage_tracking']['Update']

export type Lead = Database['public']['Tables']['leads']['Row']
export type LeadInsert = Database['public']['Tables']['leads']['Insert']
export type LeadUpdate = Database['public']['Tables']['leads']['Update']

export type BillingEvent = Database['public']['Tables']['billing_events']['Row']
export type BillingEventInsert = Database['public']['Tables']['billing_events']['Insert']
export type BillingEventUpdate = Database['public']['Tables']['billing_events']['Update']

export interface ShareSettings {
  requirePassword: boolean
  embedPasswordInLink: boolean
  password?: string
  expirationHours?: number
}

export interface ShareResponse {
  shareToken: string
  shareUrl: string
}

export interface UsageStats {
  currentMonth: {
    sharesCount: number
    maxShares: number | null
    mfaEntriesCount: number
  }
  canCreateShare: boolean
  userTier: 'free' | 'pro' | 'enterprise'
}

export interface OnboardingData {
  displayName?: string
  company?: string
  useCase?: 'personal' | 'business' | 'team'
  newsletterConsent?: boolean
  productUpdatesConsent?: boolean
  invitationCode?: string
}