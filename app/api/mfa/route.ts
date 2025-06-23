import { NextRequest, NextResponse } from 'next/server'

import { decryptSecret,encryptSecret } from '@/lib/crypto'
import type { MfaEntryInsert } from '@/types/database'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: user, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: entries, error } = await supabase
      .from('mfa_entries')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Decrypt secrets for client use
    const decryptedEntries = entries?.map(entry => ({
      ...entry,
      secret: decryptSecret(entry.secret)
    }))

    return NextResponse.json({ entries: decryptedEntries })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: user, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, secret, notes } = body

    if (!name || !secret) {
      return NextResponse.json({ error: 'Name and secret are required' }, { status: 400 })
    }

    const encryptedSecret = encryptSecret(secret)

    const newEntry: MfaEntryInsert = {
      user_id: user.user.id,
      name,
      secret: encryptedSecret,
      notes: notes || null,
    }

    const { data: entry, error } = await supabase
      .from('mfa_entries')
      .insert(newEntry)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Return with decrypted secret
    const responseEntry = {
      ...entry,
      secret: decryptSecret(entry.secret)
    }

    return NextResponse.json({ entry: responseEntry }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 