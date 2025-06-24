import { NextResponse } from 'next/server';

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

    // Get user's shared links with MFA entry details
    const { data: sharedLinks, error: linksError } = await supabase
      .from('shared_links')
      .select(
        `
        *,
        mfa_entries!inner(
          id,
          name,
          user_id
        )
      `
      )
      .eq('mfa_entries.user_id', user.id)
      .order('created_at', { ascending: false });

    if (linksError) {
      console.error('Shared links fetch error:', linksError);
      return NextResponse.json({ error: 'Failed to fetch shared links' }, { status: 500 });
    }

    // Transform the data to include service names
    const transformedLinks =
      sharedLinks?.map((link) => ({
        id: link.id,
        mfa_entry_id: link.mfa_entry_id,
        token: link.share_token,
        expires_at: link.expires_at,
        access_count: link.click_count,
        max_access_count: null, // This field doesn't exist in current schema
        is_active: link.status === 'active',
        created_at: link.created_at,
        service_name: link.mfa_entries?.name,
      })) || [];

    return NextResponse.json({
      shared_links: transformedLinks,
    });
  } catch (error) {
    console.error('Shared links API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
