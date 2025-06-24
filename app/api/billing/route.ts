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

    const { event_type, metadata } = await request.json();

    // Validate event type
    const validEventTypes = [
      'subscription_created',
      'subscription_cancelled',
      'subscription_updated',
      'payment_succeeded',
      'payment_failed',
      'trial_started',
      'trial_ended',
      'usage_limit_exceeded',
      'referral_signup',
      'onboarding_completed',
    ];

    if (!validEventTypes.includes(event_type)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    // Record billing event
    await prisma.billing_events.create({
      data: {
        user_id: user.id,
        event_type,
        status: 'completed', // Default status for billing events
        metadata: metadata || {},
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Billing API error:', error);
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

    // Get user profile with billing info
    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: {
        subscription_status: true,
        user_tier: true,
        available_credits: true,
        current_period_end: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get recent billing events
    const billingEvents = await prisma.billing_events.findMany({
      where: { user_id: user.id },
      select: {
        event_type: true,
        metadata: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 10,
    });

    // Calculate trial status
    const now = new Date();
    const trialEndsAt = profile.current_period_end ? new Date(profile.current_period_end) : null;
    const isTrialActive = trialEndsAt && trialEndsAt > now;
    const trialDaysRemaining = isTrialActive
      ? Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Determine current plan details
    const planDetails = {
      free: {
        name: 'Free',
        monthly_shares: 10,
        features: ['10 shares per month', 'Basic link sharing', 'Email support'],
      },
      pro: {
        name: 'Pro',
        monthly_shares: 100,
        features: ['100 shares per month', 'Advanced sharing options', 'Analytics', 'Priority support'],
      },
      unlimited: {
        name: 'Unlimited',
        monthly_shares: -1, // -1 indicates unlimited
        features: ['Unlimited shares', 'All Pro features', 'Custom domains', 'API access', 'Priority support'],
      },
    };

    const currentPlan = planDetails[profile.user_tier as keyof typeof planDetails] || planDetails.free;

    return NextResponse.json({
      subscription: {
        status: profile.subscription_status || 'free',
        plan: profile.user_tier || 'free',
        plan_details: currentPlan,
        trial_active: isTrialActive,
        trial_days_remaining: trialDaysRemaining,
        available_credits: profile.available_credits || 0,
      },
      recent_events: billingEvents,
    });
  } catch (error) {
    console.error('Billing GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
