import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      name,
      company,
      tier_interest,
      message,
      source = 'pricing_page',
      referrer_url,
      utm_source,
      utm_medium,
      utm_campaign,
    } = body;

    // Validate required fields
    if (!email || !tier_interest) {
      return NextResponse.json({ error: 'Email and tier interest are required' }, { status: 400 });
    }

    // Validate tier_interest
    if (!['pro', 'enterprise', 'newsletter'].includes(tier_interest)) {
      return NextResponse.json({ error: 'Invalid tier interest' }, { status: 400 });
    }

    // Create lead data
    const leadData = {
      email,
      name: name || null,
      company: company || null,
      tier_interest,
      message: message || null,
      source,
      referrer_url: referrer_url || null,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      status: 'new' as const,
    };

    try {
      // Insert lead into database
      const data = await prisma.leads.create({
        data: leadData,
      });

      return NextResponse.json({
        message: 'Lead created successfully',
        lead: data,
      });
    } catch (error: unknown) {
      // Handle duplicate lead (same email + tier_interest)
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        // Update existing lead instead of creating new one
        await prisma.leads.updateMany({
          where: {
            email,
            tier_interest,
          },
          data: {
            name: name || null,
            company: company || null,
            message: message || null,
            source,
            referrer_url: referrer_url || null,
            utm_source: utm_source || null,
            utm_medium: utm_medium || null,
            utm_campaign: utm_campaign || null,
            updated_at: new Date(),
          },
        });

        // Get the updated record to return
        const updatedLead = await prisma.leads.findFirst({
          where: {
            email,
            tier_interest,
          },
        });

        return NextResponse.json({
          message: 'Lead updated successfully',
          lead: updatedLead,
        });
      }

      console.error('Error creating lead:', error);
      return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
    }

    // TODO: Send email notification to admin about new lead
    // This would be implemented with your email service of choice
  } catch (error) {
    console.error('Unexpected error in leads API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    // Check if user is authenticated (admin check would be added in Phase 3)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return empty array since this is admin-only in Phase 3
    // In Phase 3, we'll add proper admin role checking
    return NextResponse.json({
      message: 'Admin access required',
      leads: [],
    });
  } catch (error) {
    console.error('Unexpected error in leads GET API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
