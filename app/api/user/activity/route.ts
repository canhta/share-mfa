import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    // For now, return mock activity data
    // In a real implementation, you would fetch from an activity_logs table
    const mockActivities = [
      {
        id: "1",
        action: "login",
        description: "Signed in to your account",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        ip_address: "192.168.1.100",
      },
      {
        id: "2",
        action: "profile_updated",
        description: "Updated profile information",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        ip_address: "192.168.1.100",
      },
      {
        id: "3",
        action: "mfa_created",
        description: 'Created new MFA entry for "Work Email"',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        ip_address: "192.168.1.100",
      },
      {
        id: "4",
        action: "mfa_shared",
        description: "Shared MFA code via secure link",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        ip_address: "192.168.1.100",
      },
    ];

    return NextResponse.json({ activities: mockActivities });
  } catch (error) {
    console.error("Activity API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
