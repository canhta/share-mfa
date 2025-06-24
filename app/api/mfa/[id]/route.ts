import { NextRequest, NextResponse } from 'next/server';

import { decryptSecret, encryptSecret } from '@/lib/crypto';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: user, error: authError } = await supabase.auth.getUser();
    if (authError || !user.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entry = await prisma.mfa_entries.findFirst({
      where: {
        id,
        user_id: user.user.id,
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'MFA entry not found' }, { status: 404 });
    }

    // Decrypt secret for client use
    const decryptedEntry = {
      ...entry,
      secret: decryptSecret(entry.secret),
    };

    return NextResponse.json({ entry: decryptedEntry });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: user, error: authError } = await supabase.auth.getUser();
    if (authError || !user.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, secret, notes } = body;

    const updateData: {
      name?: string;
      secret?: string;
      notes?: string | null;
    } = {
      ...(name && { name }),
      ...(secret && { secret: encryptSecret(secret) }),
      ...(notes !== undefined && { notes }),
    };

    const entry = await prisma.mfa_entries.update({
      where: {
        id,
        user_id: user.user.id,
      },
      data: updateData,
    });

    if (!entry) {
      return NextResponse.json({ error: 'Failed to update MFA entry' }, { status: 500 });
    }

    // Return with decrypted secret
    const responseEntry = {
      ...entry,
      secret: decryptSecret(entry.secret),
    };

    return NextResponse.json({ entry: responseEntry });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: user, error: authError } = await supabase.auth.getUser();
    if (authError || !user.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.mfa_entries.delete({
      where: {
        id,
        user_id: user.user.id,
      },
    });

    return NextResponse.json({ message: 'MFA entry deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
