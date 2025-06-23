import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const { action, metadata } = await request.json()

    // Validate action type
    const validActions = ['share_generated', 'share_accessed', 'mfa_added', 'qr_scanned']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action type' },
        { status: 400 }
      )
    }

    // Record usage event in the new usage_events table
    const { error: insertError } = await supabase
      .from('usage_events')
      .insert({
        user_id: user.id,
        action,
        metadata: metadata || {},
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Usage event insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to record usage' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('Usage tracking API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Get user's usage events from the new usage_events table
    const { data: usageEvents, error: eventsError } = await supabase
      .from('usage_events')
      .select('action, created_at, metadata')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (eventsError) {
      console.error('Usage events fetch error:', eventsError)
      return NextResponse.json(
        { error: 'Failed to fetch usage statistics' },
        { status: 500 }
      )
    }

    // Aggregate statistics
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recentEvents = usageEvents.filter(event => new Date(event.created_at) >= thirtyDaysAgo)
    const weeklyEvents = usageEvents.filter(event => new Date(event.created_at) >= sevenDaysAgo)

    const aggregated = {
      total: {
        shares_generated: usageEvents.filter(e => e.action === 'share_generated').length,
        shares_accessed: usageEvents.filter(e => e.action === 'share_accessed').length,
        mfa_entries_added: usageEvents.filter(e => e.action === 'mfa_added').length,
        qr_codes_scanned: usageEvents.filter(e => e.action === 'qr_scanned').length
      },
      last_30_days: {
        shares_generated: recentEvents.filter(e => e.action === 'share_generated').length,
        shares_accessed: recentEvents.filter(e => e.action === 'share_accessed').length,
        mfa_entries_added: recentEvents.filter(e => e.action === 'mfa_added').length,
        qr_codes_scanned: recentEvents.filter(e => e.action === 'qr_scanned').length
      },
      last_7_days: {
        shares_generated: weeklyEvents.filter(e => e.action === 'share_generated').length,
        shares_accessed: weeklyEvents.filter(e => e.action === 'share_accessed').length,
        mfa_entries_added: weeklyEvents.filter(e => e.action === 'mfa_added').length,
        qr_codes_scanned: weeklyEvents.filter(e => e.action === 'qr_scanned').length
      }
    }

    return NextResponse.json({
      stats: aggregated,
      recent_activity: usageEvents.slice(0, 20) // Return 20 most recent activities
    })
  } catch (error) {
    console.error('Usage tracking GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
