import { Prisma } from '@prisma/client';
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
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search') || '';
    const tier = url.searchParams.get('tier') || '';
    const status = url.searchParams.get('status') || '';

    const offset = (page - 1) * limit;

    // Build where clause
    const where: Prisma.profilesWhereInput = {};

    // Apply filters
    if (search) {
      where.OR = [{ display_name: { contains: search, mode: 'insensitive' } }, { id: { equals: search } }];
    }

    if (tier) {
      where.user_tier = tier;
    }

    if (status) {
      where.subscription_status = status;
    }

    // Get total count for pagination
    const count = await prisma.profiles.count({ where });

    // Get paginated results
    const users = await prisma.profiles.findMany({
      where,
      select: {
        id: true,
        display_name: true,
        user_tier: true,
        subscription_status: true,
        onboarding_completed: true,
        created_at: true,
        updated_at: true,
        available_credits: true,
        total_credits_earned: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      skip: offset,
      take: limit,
    });

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { userId, action, value, reason } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get current user data for audit log
    const currentUser = await prisma.profiles.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: Prisma.profilesUpdateInput = {};
    let oldValue = '';
    let newValue = '';

    switch (action) {
      case 'change_tier':
        oldValue = currentUser.user_tier;
        newValue = value;
        updateData.user_tier = value;
        break;

      case 'toggle_status':
        oldValue = currentUser.subscription_status || 'active';
        newValue = value;
        updateData.subscription_status = value;
        break;

      case 'adjust_credits':
        oldValue = currentUser.available_credits?.toString() || '0';
        newValue = value.toString();
        updateData.available_credits = value;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update user
    await prisma.profiles.update({
      where: { id: userId },
      data: updateData,
    });

    // Log admin action
    try {
      await prisma.admin_actions.create({
        data: {
          admin_id: user.id,
          action_type: action,
          target_id: userId,
          target_type: 'user',
          old_value: oldValue,
          new_value: newValue,
          description: reason || `Admin ${action} for user`,
          metadata: { user_email: currentUser.display_name },
        },
      });
    } catch (logError) {
      console.error('Error logging admin action:', logError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
