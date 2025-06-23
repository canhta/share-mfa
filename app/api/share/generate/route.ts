import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

import { hashPassword } from "@/lib/crypto";
import type { ShareResponse } from "@/types/database";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: user, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      mfaEntryId,
      requirePassword,
      embedPasswordInLink,
      password,
      expirationHours = 24,
    }: {
      mfaEntryId: string;
      requirePassword: boolean;
      embedPasswordInLink: boolean;
      password?: string;
      expirationHours?: number;
    } = body;

    if (!mfaEntryId) {
      return NextResponse.json(
        { error: "MFA entry ID is required" },
        { status: 400 },
      );
    }

    if ((requirePassword || embedPasswordInLink) && !password) {
      return NextResponse.json(
        { error: "Password is required when password protection is enabled" },
        { status: 400 },
      );
    }

    // Verify the MFA entry belongs to the user
    const { data: entry, error: entryError } = await supabase
      .from("mfa_entries")
      .select("id")
      .eq("id", mfaEntryId)
      .single();

    if (entryError || !entry) {
      return NextResponse.json(
        { error: "MFA entry not found" },
        { status: 404 },
      );
    }

    // Generate share token
    const shareToken = nanoid(32);

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await hashPassword(password);
    }

    // Update the MFA entry with sharing settings
    const { error: updateError } = await supabase
      .from("mfa_entries")
      .update({
        share_token: shareToken,
        share_password: hashedPassword,
        require_password: requirePassword,
        embed_password_in_link: embedPasswordInLink,
        token_expires_at: expiresAt.toISOString(),
      })
      .eq("id", mfaEntryId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to generate share link" },
        { status: 500 },
      );
    }

    // Build share URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    let shareUrl = `${baseUrl}/share/${shareToken}`;

    if (embedPasswordInLink && password) {
      // Encode password in URL (warn user about security implications)
      const encodedPassword = encodeURIComponent(password);
      shareUrl += `?p=${encodedPassword}`;
    }

    const response: ShareResponse = {
      shareToken,
      shareUrl,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
