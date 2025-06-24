import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

async function checkAdminRole(userId: string) {
  const profile = await prisma.profiles.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return profile?.role === 'admin';
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const isAdmin = await checkAdminRole(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const startDate =
      url.searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = url.searchParams.get('end_date') || new Date().toISOString().split('T')[0];

    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate + 'T23:59:59.999Z');

    // Get user analytics
    const userStats = await prisma.profiles.findMany({
      where: {
        created_at: {
          gte: startDateTime,
          lte: endDateTime,
        },
      },
      select: {
        user_tier: true,
        subscription_status: true,
        created_at: true,
      },
    });

    // Get total users count
    const totalUsers = await prisma.profiles.count();

    // Get active users (users who have entries in the date range)
    const activeUsers = await prisma.mfa_entries.groupBy({
      by: ['user_id'],
      where: {
        created_at: {
          gte: startDateTime,
          lte: endDateTime,
        },
      },
      _count: {
        user_id: true,
      },
    });

    // Get MFA entries created
    const mfaEntriesCreated = await prisma.mfa_entries.count({
      where: {
        created_at: {
          gte: startDateTime,
          lte: endDateTime,
        },
      },
    });

    // Get share links generated
    const shareLinksGenerated = await prisma.mfa_entries.count({
      where: {
        share_token: {
          not: null,
        },
        updated_at: {
          gte: startDateTime,
          lte: endDateTime,
        },
      },
    });

    // Get leads data
    const leadsData = await prisma.leads.findMany({
      where: {
        created_at: {
          gte: startDateTime,
          lte: endDateTime,
        },
      },
      select: {
        status: true,
        tier_interest: true,
        source: true,
        created_at: true,
      },
    });

    // Get revenue events
    const revenueData = await prisma.revenue_events.findMany({
      where: {
        created_at: {
          gte: startDateTime,
          lte: endDateTime,
        },
      },
      select: {
        event_type: true,
        amount: true,
        created_at: true,
      },
    });

    // Process user tier distribution
    const tierDistribution = {
      free: userStats.filter((u) => u.user_tier === 'free').length,
      pro: userStats.filter((u) => u.user_tier === 'pro').length,
      enterprise: userStats.filter((u) => u.user_tier === 'enterprise').length,
    };

    // Process subscription status distribution
    const subscriptionDistribution = {
      active: userStats.filter((u) => u.subscription_status === 'active').length,
      canceled: userStats.filter((u) => u.subscription_status === 'canceled').length,
      past_due: userStats.filter((u) => u.subscription_status === 'past_due').length,
      trialing: userStats.filter((u) => u.subscription_status === 'trialing').length,
      none: userStats.filter((u) => !u.subscription_status).length,
    };

    // Process leads analytics
    const leadStats = {
      total: leadsData.length,
      new: leadsData.filter((l) => l.status === 'new').length,
      contacted: leadsData.filter((l) => l.status === 'contacted').length,
      converted: leadsData.filter((l) => l.status === 'converted').length,
      byTierInterest: {
        pro: leadsData.filter((l) => l.tier_interest === 'pro').length,
        enterprise: leadsData.filter((l) => l.tier_interest === 'enterprise').length,
        newsletter: leadsData.filter((l) => l.tier_interest === 'newsletter').length,
      },
      bySource: leadsData.reduce((acc: Record<string, number>, lead) => {
        const source = lead.source || 'unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {}),
    };

    // Process revenue analytics
    const revenueStats = {
      totalRevenue: revenueData.reduce((sum, event) => sum + Number(event.amount || 0), 0),
      subscriptions: revenueData.filter((e) => e.event_type === 'subscription').length,
      upgrades: revenueData.filter((e) => e.event_type === 'upgrade').length,
      downgrades: revenueData.filter((e) => e.event_type === 'downgrade').length,
      churn: revenueData.filter((e) => e.event_type === 'churn').length,
    };

    // User growth over time
    const userGrowthData = userStats.reduce((acc: Record<string, number>, user) => {
      const date = user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : '';
      if (date) {
        acc[date] = (acc[date] || 0) + 1;
      }
      return acc;
    }, {});

    const analytics = {
      overview: {
        totalUsers,
        activeUsers: activeUsers.length,
        mfaEntriesCreated,
        shareLinksGenerated,
      },
      userAnalytics: {
        tierDistribution,
        subscriptionDistribution,
        growthData: userGrowthData,
      },
      usageAnalytics: {
        mfaEntriesCreated,
        shareLinksGenerated,
      },
      leadAnalytics: leadStats,
      revenueAnalytics: revenueStats,
      dateRange: {
        startDate,
        endDate,
      },
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
