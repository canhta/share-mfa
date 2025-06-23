import { NextRequest, NextResponse } from 'next/server'

import { decryptSecret,encryptSecret } from '@/lib/crypto'
import type { MfaEntryInsert } from '@/types/database'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: entries, error } = await supabase
      .from('mfa_entries')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error fetching MFA entries:', error)
      return NextResponse.json({ error: 'Failed to fetch MFA entries' }, { status: 500 })
    }

    // Decrypt secrets for client use
    const decryptedEntries = entries?.map(entry => ({
      ...entry,
      secret: decryptSecret(entry.secret)
    }))

    return NextResponse.json({ entries: decryptedEntries })
  } catch (error) {
    console.error('MFA GET API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, secret, notes } = body

    if (!name || !secret) {
      return NextResponse.json({ error: 'Name and secret are required' }, { status: 400 })
    }

    // Validate secret format (basic TOTP secret validation)
    if (typeof secret !== 'string' || secret.trim().length < 16) {
      return NextResponse.json({ error: 'Invalid secret format' }, { status: 400 })
    }

    const encryptedSecret = encryptSecret(secret.trim())

    const newEntry: MfaEntryInsert = {
      user_id: user.id,
      name: name.trim(),
      secret: encryptedSecret,
      notes: notes?.trim() || null,
    }

    const { data: entry, error } = await supabase
      .from('mfa_entries')
      .insert(newEntry)
      .select()
      .single()

    if (error) {
      console.error('Database error inserting MFA entry:', error)
      
      // Handle specific database errors
      if (error.code === '42501') {
        return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
      } else if (error.code === '23505') {
        return NextResponse.json({ error: 'An entry with this name already exists' }, { status: 409 })
      } else {
        return NextResponse.json({ error: 'Failed to create MFA entry' }, { status: 500 })
      }
    }

    // Return with decrypted secret for immediate use
    const responseEntry = {
      ...entry,
      secret: decryptSecret(entry.secret)
    }

    // Track MFA entry creation event
    try {
      await supabase
        .from('usage_events')
        .insert({
          user_id: user.id,
          action: 'mfa_added',
          metadata: {
            entry_name: name.trim(),
            entry_id: entry.id
          }
        })
    } catch (usageError) {
      // Don't fail the request if usage tracking fails
      console.warn('Failed to track MFA creation event:', usageError)
    }

    return NextResponse.json({ entry: responseEntry }, { status: 201 })
  } catch (error) {
    console.error('MFA API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 