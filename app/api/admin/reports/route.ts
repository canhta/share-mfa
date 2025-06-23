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

function formatCSV(data: unknown[], headers: string[]): string {
  const csvHeaders = headers.join(",");
  const csvRows = data
    .map((row) => {
      return headers
        .map((header) => {
          const value = (row as Record<string, unknown>)[header];
          // Escape commas and quotes in CSV
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value?.toString() || "";
        })
        .join(",");
    })
    .join("\n");

  return `${csvHeaders}\n${csvRows}`;
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
    const reportType = url.searchParams.get("type") || "users";
    const format = url.searchParams.get("format") || "json";
    const startDate =
      url.searchParams.get("start_date") ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
    const endDate =
      url.searchParams.get("end_date") ||
      new Date().toISOString().split("T")[0];

    let data: unknown[] = [];
    let headers: string[] = [];

    switch (reportType) {
      case "users":
        const { data: usersData } = await supabase
          .from("profiles")
          .select(
            `
            id,
            display_name,
            user_tier,
            subscription_status,
            onboarding_completed,
            created_at,
            available_credits,
            total_credits_earned
          `,
          )
          .gte("created_at", startDate)
          .lte("created_at", endDate + "T23:59:59.999Z")
          .order("created_at", { ascending: false });

        data = usersData || [];
        headers = [
          "id",
          "display_name",
          "user_tier",
          "subscription_status",
          "onboarding_completed",
          "created_at",
          "available_credits",
          "total_credits_earned",
        ];
        break;

      case "leads":
        const { data: leadsData } = await supabase
          .from("leads")
          .select("*")
          .gte("created_at", startDate)
          .lte("created_at", endDate + "T23:59:59.999Z")
          .order("created_at", { ascending: false });

        data = leadsData || [];
        headers = [
          "id",
          "email",
          "name",
          "company",
          "tier_interest",
          "status",
          "source",
          "lead_score",
          "notes",
          "created_at",
          "follow_up_date",
        ];
        break;

      case "mfa_entries":
        const { data: mfaData } = await supabase
          .from("mfa_entries")
          .select(
            `
            id,
            user_id,
            name,
            require_password,
            share_token,
            created_at,
            updated_at
          `,
          )
          .gte("created_at", startDate)
          .lte("created_at", endDate + "T23:59:59.999Z")
          .order("created_at", { ascending: false });

        data = mfaData || [];
        headers = [
          "id",
          "user_id",
          "name",
          "require_password",
          "share_token",
          "created_at",
          "updated_at",
        ];
        break;

      case "revenue":
        const { data: revenueData } = await supabase
          .from("revenue_events")
          .select("*")
          .gte("created_at", startDate)
          .lte("created_at", endDate + "T23:59:59.999Z")
          .order("created_at", { ascending: false });

        data = revenueData || [];
        headers = [
          "id",
          "user_id",
          "event_type",
          "amount",
          "currency",
          "subscription_plan",
          "billing_period",
          "created_at",
        ];
        break;

      case "admin_actions":
        const { data: actionsData } = await supabase
          .from("admin_actions")
          .select(
            `
            id,
            admin_id,
            action_type,
            target_id,
            target_type,
            old_value,
            new_value,
            description,
            created_at
          `,
          )
          .gte("created_at", startDate)
          .lte("created_at", endDate + "T23:59:59.999Z")
          .order("created_at", { ascending: false });

        data = actionsData || [];
        headers = [
          "id",
          "admin_id",
          "action_type",
          "target_id",
          "target_type",
          "old_value",
          "new_value",
          "description",
          "created_at",
        ];
        break;

      case "feature_usage":
        const { data: featureData } = await supabase
          .from("feature_usage")
          .select("*")
          .gte("created_at", startDate)
          .lte("created_at", endDate + "T23:59:59.999Z")
          .order("created_at", { ascending: false });

        data = featureData || [];
        headers = [
          "id",
          "user_id",
          "feature_name",
          "usage_count",
          "first_used_at",
          "last_used_at",
          "created_at",
        ];
        break;

      default:
        return NextResponse.json(
          { error: "Invalid report type" },
          { status: 400 },
        );
    }

    // Log the report generation
    await supabase.from("admin_actions").insert({
      admin_id: user.id,
      action_type: "generate_report",
      target_type: "system",
      description: `Generated ${reportType} report (${format} format)`,
      metadata: {
        report_type: reportType,
        format: format,
        start_date: startDate,
        end_date: endDate,
        record_count: data.length,
      },
    });

    if (format === "csv") {
      const csvContent = formatCSV(data, headers);

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${reportType}_report_${startDate}_to_${endDate}.csv"`,
        },
      });
    }

    return NextResponse.json({
      reportType,
      data,
      metadata: {
        startDate,
        endDate,
        recordCount: data.length,
        generatedAt: new Date().toISOString(),
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
