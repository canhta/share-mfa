import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

async function checkAdminRole(supabase: SupabaseClient, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  return profile?.role === 'admin'
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const isAdmin = await checkAdminRole(supabase, user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query parameters
    const url = new URL(request.url)
    const startDate = url.searchParams.get('start_date') || 
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const endDate = url.searchParams.get('end_date') || 
      new Date().toISOString().split('T')[0]

    // Get user analytics
    const { data: userStats } = await supabase
      .from('profiles')
      .select('user_tier, subscription_status, created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate + 'T23:59:59.999Z')

    // Get total users count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Get active users (users who have entries)
    const { count: activeUsers } = await supabase
      .from('mfa_entries')
      .select('user_id', { count: 'exact', head: true })
      .gte('created_at', startDate)
      .lte('created_at', endDate + 'T23:59:59.999Z')

    // Get MFA entries created
    const { count: mfaEntriesCreated } = await supabase
      .from('mfa_entries')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
      .lte('created_at', endDate + 'T23:59:59.999Z')

    // Get share links generated
    const { count: shareLinksGenerated } = await supabase
      .from('mfa_entries')
      .select('*', { count: 'exact', head: true })
      .not('share_token', 'is', null)
      .gte('updated_at', startDate)
      .lte('updated_at', endDate + 'T23:59:59.999Z')

    // Get leads data
    const { data: leadsData } = await supabase
      .from('leads')
      .select('status, tier_interest, source, created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate + 'T23:59:59.999Z')

    // Get revenue events
    const { data: revenueData } = await supabase
      .from('revenue_events')
      .select('event_type, amount, created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate + 'T23:59:59.999Z')

    // Process user tier distribution
    const tierDistribution = {
      free: userStats?.filter(u => u.user_tier === 'free').length || 0,
      pro: userStats?.filter(u => u.user_tier === 'pro').length || 0,
      enterprise: userStats?.filter(u => u.user_tier === 'enterprise').length || 0
    }

    // Process subscription status distribution
    const subscriptionDistribution = {
      active: userStats?.filter(u => u.subscription_status === 'active').length || 0,
      canceled: userStats?.filter(u => u.subscription_status === 'canceled').length || 0,
      past_due: userStats?.filter(u => u.subscription_status === 'past_due').length || 0,
      trialing: userStats?.filter(u => u.subscription_status === 'trialing').length || 0,
      none: userStats?.filter(u => !u.subscription_status).length || 0
    }

    // Process leads analytics
    const leadStats = {
      total: leadsData?.length || 0,
      new: leadsData?.filter(l => l.status === 'new').length || 0,
      contacted: leadsData?.filter(l => l.status === 'contacted').length || 0,
      converted: leadsData?.filter(l => l.status === 'converted').length || 0,
      byTierInterest: {
        pro: leadsData?.filter(l => l.tier_interest === 'pro').length || 0,
        enterprise: leadsData?.filter(l => l.tier_interest === 'enterprise').length || 0,
        newsletter: leadsData?.filter(l => l.tier_interest === 'newsletter').length || 0
      },
      bySource: leadsData?.reduce((acc: Record<string, number>, lead) => {
        const source = lead.source || 'unknown'
        acc[source] = (acc[source] || 0) + 1
        return acc
      }, {}) || {}
    }

    // Process revenue analytics
    const revenueStats = {
      totalRevenue: revenueData?.reduce((sum, event) => sum + (event.amount || 0), 0) || 0,
      subscriptions: revenueData?.filter(e => e.event_type === 'subscription').length || 0,
      upgrades: revenueData?.filter(e => e.event_type === 'upgrade').length || 0,
      downgrades: revenueData?.filter(e => e.event_type === 'downgrade').length || 0,
      churn: revenueData?.filter(e => e.event_type === 'churn').length || 0
    }

    // User growth over time (simplified - could be enhanced with SQL functions)
    const userGrowthData = userStats?.reduce((acc: Record<string, number>, user) => {
      const date = new Date(user.created_at).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {}) || {}

    const analytics = {
      overview: {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        mfaEntriesCreated: mfaEntriesCreated || 0,
        shareLinksGenerated: shareLinksGenerated || 0
      },
      userAnalytics: {
        tierDistribution,
        subscriptionDistribution,
        growthData: userGrowthData
      },
      usageAnalytics: {
        mfaEntriesCreated: mfaEntriesCreated || 0,
        shareLinksGenerated: shareLinksGenerated || 0
      },
      leadAnalytics: leadStats,
      revenueAnalytics: revenueStats,
      dateRange: {
        startDate,
        endDate
      }
    }

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
