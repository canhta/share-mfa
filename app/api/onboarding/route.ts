import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { OnboardingData } from '@/types';
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

    const onboardingData: OnboardingData = await request.json();

    // Check if profile already exists
    const existingProfile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: { id: true },
    });

    if (existingProfile) {
      // Update existing profile
      await prisma.profiles.update({
        where: { id: user.id },
        data: {
          display_name: onboardingData.displayName,
          company: onboardingData.company,
          use_case: onboardingData.useCase,
          newsletter_consent: onboardingData.newsletterConsent,
          product_updates_consent: onboardingData.productUpdatesConsent,
          onboarding_completed: true,
          updated_at: new Date(),
        },
      });
    } else {
      // Create new profile
      await prisma.profiles.create({
        data: {
          id: user.id,
          display_name: onboardingData.displayName,
          company: onboardingData.company,
          use_case: onboardingData.useCase,
          newsletter_consent: onboardingData.newsletterConsent,
          product_updates_consent: onboardingData.productUpdatesConsent,
          onboarding_completed: true,
          available_credits: 0, // Start with 0 credits
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    }

    // Process invitation code if provided
    if (onboardingData.invitationCode?.trim()) {
      try {
        // Find the referrer by checking user profiles - we'll need to check a different field
        // For now, we'll skip this referral logic since invitation_code isn't in the schema
        console.log(`Referral code provided: ${onboardingData.invitationCode.trim()}`);

        // Track the referral attempt event
        await prisma.billing_events.create({
          data: {
            user_id: user.id,
            event_type: 'referral_attempt',
            status: 'pending',
            metadata: {
              invitation_code: onboardingData.invitationCode.trim(),
            },
            created_at: new Date(),
          },
        });
      } catch (referralError) {
        // Don't fail onboarding if referral processing fails
        console.error('Referral processing error:', referralError);
      }
    }

    // Track onboarding completion
    await prisma.billing_events.create({
      data: {
        user_id: user.id,
        event_type: 'onboarding_completed',
        status: 'completed',
        metadata: {
          use_case: onboardingData.useCase,
          company: onboardingData.company,
          has_invitation_code: !!onboardingData.invitationCode?.trim(),
        },
        created_at: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Onboarding completed successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Onboarding API error:', error);
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

    // Get user profile
    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json({
      profile,
      onboardingCompleted: profile?.onboarding_completed || false,
    });
  } catch (error) {
    console.error('Onboarding GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
