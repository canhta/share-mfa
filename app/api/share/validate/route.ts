import { NextRequest, NextResponse } from 'next/server';

import { decryptSecret, verifyPassword } from '@/lib/crypto';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shareToken, password } = body;

    if (!shareToken) {
      return NextResponse.json({ error: 'Share token is required' }, { status: 400 });
    }

    // Find the MFA entry by share token
    const entry = await prisma.mfa_entries.findUnique({
      where: { share_token: shareToken },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Invalid share token' }, { status: 404 });
    }

    // Check if token has expired
    if (entry.token_expires_at) {
      const expiresAt = new Date(entry.token_expires_at);
      if (expiresAt < new Date()) {
        return NextResponse.json({ error: 'Share link has expired' }, { status: 410 });
      }
    }

    // Check password if required
    if (entry.require_password && !entry.embed_password_in_link) {
      if (!password) {
        return NextResponse.json({ error: 'Password is required' }, { status: 400 });
      }

      if (!entry.share_password) {
        return NextResponse.json({ error: 'Invalid configuration' }, { status: 500 });
      }

      const isValidPassword = await verifyPassword(password, entry.share_password);
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }
    }

    // Return the MFA entry with decrypted secret (read-only access)
    const responseEntry = {
      id: entry.id,
      name: entry.name,
      secret: decryptSecret(entry.secret),
      notes: entry.notes,
      created_at: entry.created_at,
    };

    return NextResponse.json({ entry: responseEntry });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
