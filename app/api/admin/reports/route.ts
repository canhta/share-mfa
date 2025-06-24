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

function formatCSV(data: unknown[], headers: string[]): string {
  const csvHeaders = headers.join(',');
  const csvRows = data
    .map((row) => {
      return headers
        .map((header) => {
          const value = (row as Record<string, unknown>)[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value?.toString() || '';
        })
        .join(',');
    })
    .join('\n');

  return `${csvHeaders}\n${csvRows}`;
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
    const reportType = url.searchParams.get('type') || 'users';
    const format = url.searchParams.get('format') || 'json';
    const startDate =
      url.searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = url.searchParams.get('end_date') || new Date().toISOString().split('T')[0];

    let data: unknown[] = [];
    let headers: string[] = [];

    switch (reportType) {
      case 'users':
        const usersData = await prisma.profiles.findMany({
          where: {
            created_at: {
              gte: new Date(startDate),
              lte: new Date(endDate + 'T23:59:59.999Z'),
            },
          },
          select: {
            id: true,
            display_name: true,
            user_tier: true,
            subscription_status: true,
            onboarding_completed: true,
            created_at: true,
            available_credits: true,
            total_credits_earned: true,
          },
          orderBy: {
            created_at: 'desc',
          },
        });

        data = usersData || [];
        headers = [
          'id',
          'display_name',
          'user_tier',
          'subscription_status',
          'onboarding_completed',
          'created_at',
          'available_credits',
          'total_credits_earned',
        ];
        break;

      case 'leads':
        const leadsData = await prisma.leads.findMany({
          where: {
            created_at: {
              gte: new Date(startDate),
              lte: new Date(endDate + 'T23:59:59.999Z'),
            },
          },
          orderBy: {
            created_at: 'desc',
          },
        });

        data = leadsData || [];
        headers = [
          'id',
          'email',
          'name',
          'company',
          'tier_interest',
          'status',
          'source',
          'lead_score',
          'notes',
          'created_at',
          'follow_up_date',
        ];
        break;

      case 'mfa_entries':
        const mfaData = await prisma.mfa_entries.findMany({
          where: {
            created_at: {
              gte: new Date(startDate),
              lte: new Date(endDate + 'T23:59:59.999Z'),
            },
          },
          select: {
            id: true,
            user_id: true,
            name: true,
            require_password: true,
            share_token: true,
            created_at: true,
            updated_at: true,
          },
          orderBy: {
            created_at: 'desc',
          },
        });

        data = mfaData || [];
        headers = ['id', 'user_id', 'name', 'require_password', 'share_token', 'created_at', 'updated_at'];
        break;

      case 'revenue':
        const revenueData = await prisma.revenue_events.findMany({
          where: {
            created_at: {
              gte: new Date(startDate),
              lte: new Date(endDate + 'T23:59:59.999Z'),
            },
          },
          orderBy: {
            created_at: 'desc',
          },
        });

        data = revenueData || [];
        headers = [
          'id',
          'user_id',
          'event_type',
          'amount',
          'currency',
          'subscription_plan',
          'billing_period',
          'created_at',
        ];
        break;

      case 'admin_actions':
        const actionsData = await prisma.admin_actions.findMany({
          where: {
            created_at: {
              gte: new Date(startDate),
              lte: new Date(endDate + 'T23:59:59.999Z'),
            },
          },
          select: {
            id: true,
            admin_id: true,
            action_type: true,
            target_id: true,
            target_type: true,
            old_value: true,
            new_value: true,
            description: true,
            created_at: true,
          },
          orderBy: {
            created_at: 'desc',
          },
        });

        data = actionsData || [];
        headers = [
          'id',
          'admin_id',
          'action_type',
          'target_id',
          'target_type',
          'old_value',
          'new_value',
          'description',
          'created_at',
        ];
        break;

      case 'feature_usage':
        const featureData = await prisma.feature_usage.findMany({
          where: {
            created_at: {
              gte: new Date(startDate),
              lte: new Date(endDate + 'T23:59:59.999Z'),
            },
          },
          orderBy: {
            created_at: 'desc',
          },
        });

        data = featureData || [];
        headers = ['id', 'user_id', 'feature_name', 'usage_count', 'first_used_at', 'last_used_at', 'created_at'];
        break;

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    // Log the report generation
    await prisma.admin_actions.create({
      data: {
        admin_id: user.id,
        action_type: 'generate_report',
        target_type: 'system',
        description: `Generated ${reportType} report (${format} format)`,
        metadata: {
          report_type: reportType,
          format: format,
          start_date: startDate,
          end_date: endDate,
          record_count: data.length,
        } as Prisma.InputJsonValue,
      },
    });

    if (format === 'csv') {
      const csvContent = formatCSV(data, headers);

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${reportType}_report_${startDate}_to_${endDate}.csv"`,
        },
      });
    }

    return NextResponse.json({
      reportType,
      data,
      metadata: {
        startDate,
        endDate,
        recordCount: data.length,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
