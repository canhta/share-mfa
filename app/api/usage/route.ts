import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const { action, metadata } = await request.json();

    // Validate action type
    const validActions = ['share_generated', 'share_accessed', 'mfa_added', 'qr_scanned'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
    }

    // Record usage event in the usage_events table
    await prisma.usage_events.create({
      data: {
        user_id: user.id,
        action,
        metadata: metadata || {},
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Usage tracking API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get user's usage events from the usage_events table
    const usageEvents = await prisma.usage_events.findMany({
      where: {
        user_id: user.id,
      },
      select: {
        action: true,
        created_at: true,
        metadata: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 100,
    });

    // Aggregate statistics
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentEvents = usageEvents.filter((event) => event.created_at && new Date(event.created_at) >= thirtyDaysAgo);
    const weeklyEvents = usageEvents.filter((event) => event.created_at && new Date(event.created_at) >= sevenDaysAgo);

    const aggregated = {
      total: {
        shares_generated: usageEvents.filter((e) => e.action === 'share_generated').length,
        shares_accessed: usageEvents.filter((e) => e.action === 'share_accessed').length,
        mfa_entries_added: usageEvents.filter((e) => e.action === 'mfa_added').length,
        qr_codes_scanned: usageEvents.filter((e) => e.action === 'qr_scanned').length,
      },
      last_30_days: {
        shares_generated: recentEvents.filter((e) => e.action === 'share_generated').length,
        shares_accessed: recentEvents.filter((e) => e.action === 'share_accessed').length,
        mfa_entries_added: recentEvents.filter((e) => e.action === 'mfa_added').length,
        qr_codes_scanned: recentEvents.filter((e) => e.action === 'qr_scanned').length,
      },
      last_7_days: {
        shares_generated: weeklyEvents.filter((e) => e.action === 'share_generated').length,
        shares_accessed: weeklyEvents.filter((e) => e.action === 'share_accessed').length,
        mfa_entries_added: weeklyEvents.filter((e) => e.action === 'mfa_added').length,
        qr_codes_scanned: weeklyEvents.filter((e) => e.action === 'qr_scanned').length,
      },
    };

    return NextResponse.json({
      stats: aggregated,
      recent_activity: usageEvents.slice(0, 20), // Return 20 most recent activities
    });
  } catch (error) {
    console.error('Usage tracking GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
