import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function checkAdminRole(supabase: SupabaseClient, userId: string) {
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();

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
    const isAdmin = await checkAdminRole(supabase, user.id);
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

    // Build query
    let query = supabase.from('admin_actions').select(`
        *,
        admin:profiles!admin_actions_admin_id_fkey(display_name)
      `);

    // Apply filters
    if (actionType) {
      query = query.eq('action_type', actionType);
    }

    if (targetType) {
      query = query.eq('target_type', targetType);
    }

    if (adminId) {
      query = query.eq('admin_id', adminId);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate + 'T23:59:59.999Z');
    }

    // Get total count for pagination
    const { count } = await supabase.from('admin_actions').select('*', { count: 'exact', head: true });

    // Get paginated results
    const { data: actions, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching admin actions:', error);
      return NextResponse.json({ error: 'Failed to fetch admin actions' }, { status: 500 });
    }

    // Get summary statistics
    const { data: actionTypes } = await supabase
      .from('admin_actions')
      .select('action_type')
      .gte('created_at', startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const actionTypeCounts =
      actionTypes?.reduce((acc: Record<string, number>, action) => {
        acc[action.action_type] = (acc[action.action_type] || 0) + 1;
        return acc;
      }, {}) || {};

    return NextResponse.json({
      actions,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
      summary: {
        actionTypeCounts,
        totalActions: count || 0,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
