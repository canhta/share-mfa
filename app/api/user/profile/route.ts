import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

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
      console.error('Profile not found for user:', user.id);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    const updateData = await request.json();

    // Update user profile
    const profile = await prisma.profiles.update({
      where: { id: user.id },
      data: {
        display_name: updateData.display_name,
        company: updateData.company,
        use_case: updateData.use_case,
        newsletter_consent: updateData.newsletter_consent,
        product_updates_consent: updateData.product_updates_consent,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
