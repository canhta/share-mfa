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
    const status = url.searchParams.get('status') || '';
    const tierInterest = url.searchParams.get('tier_interest') || '';
    const source = url.searchParams.get('source') || '';

    const offset = (page - 1) * limit;

    // Build where clause
    const where: Prisma.leadsWhereInput = {};

    // Apply filters
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (tierInterest) {
      where.tier_interest = tierInterest;
    }

    if (source) {
      where.source = source;
    }

    // Get total count for pagination
    const count = await prisma.leads.count({ where });

    // Get paginated results
    const leads = await prisma.leads.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
      skip: offset,
      take: limit,
    });

    return NextResponse.json({
      leads,
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
    const { leadId, action, value, notes } = body;

    if (!leadId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get current lead data for audit log
    const currentLead = await prisma.leads.findUnique({
      where: { id: leadId },
    });

    if (!currentLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const updateData: Prisma.leadsUpdateInput = {};
    let oldValue = '';
    let newValue = '';

    switch (action) {
      case 'update_status':
        oldValue = currentLead.status;
        newValue = value;
        updateData.status = value;
        if (value === 'contacted') {
          updateData.last_contacted_at = new Date();
        }
        if (value === 'converted') {
          updateData.conversion_date = new Date();
        }
        break;

      case 'update_score':
        oldValue = currentLead.lead_score?.toString() || '0';
        newValue = value.toString();
        updateData.lead_score = value;
        break;

      case 'assign_to':
        oldValue = currentLead.assigned_to || 'unassigned';
        newValue = value || 'unassigned';
        if (value) {
          updateData.users = { connect: { id: value } };
        } else {
          updateData.users = { disconnect: true };
        }
        break;

      case 'add_notes':
        oldValue = currentLead.notes || '';
        newValue = notes || '';
        updateData.notes = notes;
        break;

      case 'set_follow_up':
        oldValue = currentLead.follow_up_date?.toISOString() || '';
        newValue = value;
        updateData.follow_up_date = new Date(value);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update lead
    await prisma.leads.update({
      where: { id: leadId },
      data: updateData,
    });

    // Log admin action
    try {
      await prisma.admin_actions.create({
        data: {
          admin_id: user.id,
          action_type: action,
          target_id: leadId,
          target_type: 'lead',
          old_value: oldValue,
          new_value: newValue,
          description: `Admin ${action} for lead ${currentLead.email}`,
          metadata: {
            lead_email: currentLead.email,
            lead_name: currentLead.name,
          },
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
