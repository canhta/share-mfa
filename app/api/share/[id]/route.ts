import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: linkId } = await params;

    // Verify the shared link belongs to the user's MFA entries
    const { data: sharedLink, error: linkError } = await supabase
      .from('shared_links')
      .select(
        `
        id,
        mfa_entries!inner(
          user_id
        )
      `
      )
      .eq('id', linkId)
      .eq('mfa_entries.user_id', user.id)
      .single();

    if (linkError || !sharedLink) {
      return NextResponse.json({ error: 'Shared link not found or access denied' }, { status: 404 });
    }

    // Delete the shared link
    const { error: deleteError } = await supabase.from('shared_links').delete().eq('id', linkId);

    if (deleteError) {
      console.error('Shared link delete error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete shared link' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Delete shared link API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
