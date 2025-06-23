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

    // Record usage event
    const { error: insertError } = await supabase
      .from('usage_tracking')
      .insert({
        user_id: user.id,
        action,
        metadata: metadata || {},
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Usage tracking insert error:', insertError)
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

    // Get user's usage statistics
    const { data: usageStats, error: statsError } = await supabase
      .from('usage_tracking')
      .select('action, created_at, metadata')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (statsError) {
      console.error('Usage stats fetch error:', statsError)
      return NextResponse.json(
        { error: 'Failed to fetch usage statistics' },
        { status: 500 }
      )
    }

    // Aggregate statistics
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recentStats = usageStats.filter(stat => new Date(stat.created_at) >= thirtyDaysAgo)
    const weeklyStats = usageStats.filter(stat => new Date(stat.created_at) >= sevenDaysAgo)

    const aggregated = {
      total: {
        shares_generated: usageStats.filter(s => s.action === 'share_generated').length,
        shares_accessed: usageStats.filter(s => s.action === 'share_accessed').length,
        mfa_entries_added: usageStats.filter(s => s.action === 'mfa_added').length,
        qr_codes_scanned: usageStats.filter(s => s.action === 'qr_scanned').length
      },
      last_30_days: {
        shares_generated: recentStats.filter(s => s.action === 'share_generated').length,
        shares_accessed: recentStats.filter(s => s.action === 'share_accessed').length,
        mfa_entries_added: recentStats.filter(s => s.action === 'mfa_added').length,
        qr_codes_scanned: recentStats.filter(s => s.action === 'qr_scanned').length
      },
      last_7_days: {
        shares_generated: weeklyStats.filter(s => s.action === 'share_generated').length,
        shares_accessed: weeklyStats.filter(s => s.action === 'share_accessed').length,
        mfa_entries_added: weeklyStats.filter(s => s.action === 'mfa_added').length,
        qr_codes_scanned: weeklyStats.filter(s => s.action === 'qr_scanned').length
      }
    }

    return NextResponse.json({
      stats: aggregated,
      recent_activity: usageStats.slice(0, 20) // Return 20 most recent activities
    })
  } catch (error) {
    console.error('Usage tracking GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
