import { NextRequest, NextResponse } from 'next/server';

import { decryptSecret, encryptSecret } from '@/lib/crypto';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entries = await prisma.mfa_entries.findMany({
      where: {
        user_id: user.id,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Decrypt secrets for client use
    const decryptedEntries = entries.map((entry) => ({
      ...entry,
      secret: decryptSecret(entry.secret),
    }));

    return NextResponse.json({ entries: decryptedEntries });
  } catch (error) {
    console.error('MFA GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, secret, notes } = body;

    if (!name || !secret) {
      return NextResponse.json({ error: 'Name and secret are required' }, { status: 400 });
    }

    // Validate secret format (basic TOTP secret validation)
    if (typeof secret !== 'string' || secret.trim().length < 16) {
      return NextResponse.json({ error: 'Invalid secret format' }, { status: 400 });
    }

    const encryptedSecret = encryptSecret(secret.trim());

    try {
      const entry = await prisma.mfa_entries.create({
        data: {
          user_id: user.id,
          name: name.trim(),
          secret: encryptedSecret,
          notes: notes?.trim() || null,
        },
      });

      // Return with decrypted secret for immediate use
      const responseEntry = {
        ...entry,
        secret: decryptSecret(entry.secret),
      };

      // Track MFA entry creation event
      try {
        await prisma.usage_events.create({
          data: {
            user_id: user.id,
            action: 'mfa_added',
            metadata: {
              entry_name: name.trim(),
              entry_id: entry.id,
            },
          },
        });
      } catch (usageError) {
        // Don't fail the request if usage tracking fails
        console.warn('Failed to track MFA creation event:', usageError);
      }

      return NextResponse.json({ entry: responseEntry }, { status: 201 });
    } catch (error) {
      console.error('Database error inserting MFA entry:', error);

      // Handle specific database errors
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        return NextResponse.json({ error: 'An entry with this name already exists' }, { status: 409 });
      } else {
        return NextResponse.json({ error: 'Failed to create MFA entry' }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('MFA API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
