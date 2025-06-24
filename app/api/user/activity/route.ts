import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Get user activity from usage_events
    const activities = await prisma.usage_events.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });

    // Transform the data to match expected format
    const formattedActivities = activities.map((activity) => ({
      id: activity.id,
      action: activity.action,
      description: getActionDescription(activity.action, activity.metadata),
      timestamp: activity.created_at?.toISOString() || new Date().toISOString(),
      metadata: activity.metadata,
    }));

    return NextResponse.json({ activities: formattedActivities });
  } catch (error) {
    console.error('Activity API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getActionDescription(action: string, metadata?: unknown): string {
  const meta = metadata as Record<string, unknown> | null;

  switch (action) {
    case 'login':
      return 'Signed in to your account';
    case 'profile_updated':
      return 'Updated profile information';
    case 'mfa_created':
      return `Created new MFA entry${meta?.name ? ` for "${meta.name}"` : ''}`;
    case 'mfa_shared':
      return 'Shared MFA code via secure link';
    case 'mfa_accessed':
      return 'MFA code was accessed via shared link';
    case 'share_generated':
      return 'Generated a new share link';
    case 'password_changed':
      return 'Changed account password';
    default:
      return `Performed action: ${action}`;
  }
}
