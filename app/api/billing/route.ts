import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const { event_type, metadata } = await request.json()

    // Validate event type
    const validEventTypes = [
      'subscription_created', 'subscription_cancelled', 'subscription_updated',
      'payment_succeeded', 'payment_failed', 'trial_started', 'trial_ended',
      'usage_limit_exceeded', 'referral_signup', 'onboarding_completed'
    ]
    
    if (!validEventTypes.includes(event_type)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      )
    }

    // Record billing event
    const { error: insertError } = await supabase
      .from('billing_events')
      .insert({
        user_id: user.id,
        event_type,
        metadata: metadata || {},
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Billing event insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to record billing event' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('Billing API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Get user profile with billing info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_plan, available_credits, trial_ends_at')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch billing information' },
        { status: 500 }
      )
    }

    // Get recent billing events
    const { data: billingEvents, error: eventsError } = await supabase
      .from('billing_events')
      .select('event_type, metadata, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (eventsError) {
      console.error('Billing events fetch error:', eventsError)
      return NextResponse.json(
        { error: 'Failed to fetch billing events' },
        { status: 500 }
      )
    }

    // Calculate trial status
    const now = new Date()
    const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null
    const isTrialActive = trialEndsAt && trialEndsAt > now
    const trialDaysRemaining = isTrialActive 
      ? Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0

    // Determine current plan details
    const planDetails = {
      free: {
        name: 'Free',
        monthly_shares: 10,
        features: ['10 shares per month', 'Basic link sharing', 'Email support']
      },
      pro: {
        name: 'Pro',
        monthly_shares: 100,
        features: ['100 shares per month', 'Advanced sharing options', 'Analytics', 'Priority support']
      },
      unlimited: {
        name: 'Unlimited',
        monthly_shares: -1, // -1 indicates unlimited
        features: ['Unlimited shares', 'All Pro features', 'Custom domains', 'API access', 'Priority support']
      }
    }

    const currentPlan = planDetails[profile.subscription_plan as keyof typeof planDetails] || planDetails.free

    return NextResponse.json({
      subscription: {
        status: profile.subscription_status || 'free',
        plan: profile.subscription_plan || 'free',
        plan_details: currentPlan,
        trial_active: isTrialActive,
        trial_days_remaining: trialDaysRemaining,
        available_credits: profile.available_credits || 0
      },
      recent_events: billingEvents
    })
  } catch (error) {
    console.error('Billing GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
