import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
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
    const sharedLink = await prisma.shared_links.findFirst({
      where: {
        id: linkId,
        mfa_entries: {
          user_id: user.id,
        },
      },
      include: {
        mfa_entries: {
          select: {
            user_id: true,
          },
        },
      },
    });

    if (!sharedLink) {
      return NextResponse.json({ error: 'Shared link not found or access denied' }, { status: 404 });
    }

    // Delete the shared link
    await prisma.shared_links.delete({
      where: { id: linkId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Delete shared link API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
