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