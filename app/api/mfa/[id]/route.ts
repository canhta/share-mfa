import { NextRequest, NextResponse } from "next/server";

import { decryptSecret, encryptSecret } from "@/lib/crypto";
import type { MfaEntryUpdate } from "@/types/database";
import { createClient } from "@/utils/supabase/server";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: user, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: entry, error } = await supabase
      .from("mfa_entries")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "MFA entry not found" },
        { status: 404 },
      );
    }

    // Decrypt secret for client use
    const decryptedEntry = {
      ...entry,
      secret: decryptSecret(entry.secret),
    };

    return NextResponse.json({ entry: decryptedEntry });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: user, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, secret, notes } = body;

    const updateData: MfaEntryUpdate = {
      ...(name && { name }),
      ...(secret && { secret: encryptSecret(secret) }),
      ...(notes !== undefined && { notes }),
    };

    const { data: entry, error } = await supabase
      .from("mfa_entries")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update MFA entry" },
        { status: 500 },
      );
    }

    // Return with decrypted secret
    const responseEntry = {
      ...entry,
      secret: decryptSecret(entry.secret),
    };

    return NextResponse.json({ entry: responseEntry });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: user, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase.from("mfa_entries").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete MFA entry" },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "MFA entry deleted successfully" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
