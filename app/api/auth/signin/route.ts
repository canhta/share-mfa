import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { provider, redirectTo } = await request.json();

    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo || `${new URL(request.url).origin}/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.error('Sign-in API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
