import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function checkAdminRole(supabase: SupabaseClient, userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return profile?.role === "admin";
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const isAdmin = await checkAdminRole(supabase, user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const search = url.searchParams.get("search") || "";
    const tier = url.searchParams.get("tier") || "";
    const status = url.searchParams.get("status") || "";

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase.from("profiles").select(`
        id,
        display_name,
        user_tier,
        subscription_status,
        onboarding_completed,
        created_at,
        updated_at,
        available_credits,
        total_credits_earned
      `);

    // Apply filters
    if (search) {
      query = query.or(`display_name.ilike.%${search}%,id.ilike.%${search}%`);
    }

    if (tier) {
      query = query.eq("user_tier", tier);
    }

    if (status) {
      query = query.eq("subscription_status", status);
    }

    // Get total count for pagination
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Get paginated results
    const { data: users, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const isAdmin = await checkAdminRole(supabase, user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, action, value, reason } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get current user data for audit log
    const { data: currentUser } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    let oldValue = "";
    let newValue = "";

    switch (action) {
      case "change_tier":
        oldValue = currentUser.user_tier;
        newValue = value;
        updateData.user_tier = value;
        break;

      case "toggle_status":
        // For now, we'll use a custom field or handle account deactivation
        oldValue = currentUser.subscription_status || "active";
        newValue = value;
        updateData.subscription_status = value;
        break;

      case "adjust_credits":
        oldValue = currentUser.available_credits.toString();
        newValue = value.toString();
        updateData.available_credits = value;
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Update user
    const { error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating user:", updateError);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 },
      );
    }

    // Log admin action
    const { error: logError } = await supabase.from("admin_actions").insert({
      admin_id: user.id,
      action_type: action,
      target_id: userId,
      target_type: "user",
      old_value: oldValue,
      new_value: newValue,
      description: reason || `Admin ${action} for user`,
      metadata: { user_email: currentUser.display_name },
    });

    if (logError) {
      console.error("Error logging admin action:", logError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
