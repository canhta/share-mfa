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
    const actionType = url.searchParams.get('action_type') || '';
    const targetType = url.searchParams.get('target_type') || '';
    const adminId = url.searchParams.get('admin_id') || '';
    const startDate = url.searchParams.get('start_date') || '';
    const endDate = url.searchParams.get('end_date') || '';

    const offset = (page - 1) * limit;

    // Build where clause
    const where: Prisma.admin_actionsWhereInput = {};

    if (actionType) {
      where.action_type = actionType;
    }

    if (targetType) {
      where.target_type = targetType;
    }

    if (adminId) {
      where.admin_id = adminId;
    }

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) {
        where.created_at.gte = new Date(startDate);
      }
      if (endDate) {
        where.created_at.lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    // Get total count for pagination
    const count = await prisma.admin_actions.count({ where });

    // Get paginated results with admin profile
    const actions = await prisma.admin_actions.findMany({
      where,
      include: {
        users: {
          include: {
            profiles: {
              select: {
                display_name: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      skip: offset,
      take: limit,
    });

    // Get summary statistics
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentActions = await prisma.admin_actions.findMany({
      where: {
        created_at: {
          gte: startDate ? new Date(startDate) : thirtyDaysAgo,
        },
      },
      select: {
        action_type: true,
      },
    });

    const actionTypeCounts = recentActions.reduce((acc: Record<string, number>, action) => {
      acc[action.action_type] = (acc[action.action_type] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      actions,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
      summary: {
        actionTypeCounts,
        totalActions: count,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
