import { NextRequest, NextResponse } from 'next/server'

import { OnboardingData } from '@/types/database'
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

    const onboardingData: OnboardingData = await request.json()

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: onboardingData.displayName,
          company: onboardingData.company,
          use_case: onboardingData.useCase,
          newsletter_consent: onboardingData.newsletterConsent,
          product_updates_consent: onboardingData.productUpdatesConsent,
          invitation_code: onboardingData.invitationCode,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Profile update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        )
      }
    } else {
      // Create new profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          display_name: onboardingData.displayName,
          company: onboardingData.company,
          use_case: onboardingData.useCase,
          newsletter_consent: onboardingData.newsletterConsent,
          product_updates_consent: onboardingData.productUpdatesConsent,
          invitation_code: onboardingData.invitationCode,
          onboarding_completed: true,
          available_credits: 0, // Start with 0 credits
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Profile creation error:', insertError)
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        )
      }
    }

    // Process invitation code if provided
    if (onboardingData.invitationCode?.trim()) {
      try {
        // Find the referrer by invitation code
        const { data: referrer } = await supabase
          .from('profiles')
          .select('id, email, available_credits')
          .eq('invitation_code', onboardingData.invitationCode.trim())
          .single()

        if (referrer) {
          // Award credits to referrer (this will be implemented in Phase 4)
          // For now, just log the successful referral
          console.log(`Referral detected: ${user.email} used code from ${referrer.email}`)
          
          // Track the referral event
          await supabase
            .from('billing_events')
            .insert({
              user_id: referrer.id,
              event_type: 'referral_signup',
              metadata: {
                referred_user_email: user.email,
                invitation_code: onboardingData.invitationCode.trim()
              },
              created_at: new Date().toISOString()
            })
        }
      } catch (referralError) {
        // Don't fail onboarding if referral processing fails
        console.error('Referral processing error:', referralError)
      }
    }

    // Track onboarding completion
    await supabase
      .from('billing_events')
      .insert({
        user_id: user.id,
        event_type: 'onboarding_completed',
        metadata: {
          use_case: onboardingData.useCase,
          company: onboardingData.company,
          has_invitation_code: !!onboardingData.invitationCode?.trim()
        },
        created_at: new Date().toISOString()
      })

    return NextResponse.json(
      { 
        success: true,
        message: 'Onboarding completed successfully' 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Onboarding API error:', error)
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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      profile,
      onboardingCompleted: profile?.onboarding_completed || false
    })
  } catch (error) {
    console.error('Onboarding GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
