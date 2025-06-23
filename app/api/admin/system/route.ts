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

export async function GET() {
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

    // Get system metrics from the last 24 hours
    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data: systemMetrics } = await supabase
      .from("system_metrics")
      .select("*")
      .gte("created_at", twentyFourHoursAgo)
      .order("created_at", { ascending: false });

    // Get system alerts
    const { data: systemAlerts } = await supabase
      .from("system_alerts")
      .select("*")
      .eq("resolved", false)
      .order("created_at", { ascending: false })
      .limit(50);

    // Get database health metrics
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: totalMfaEntries } = await supabase
      .from("mfa_entries")
      .select("*", { count: "exact", head: true });

    const { count: totalLeads } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true });

    // Get recent error rates (if available in metrics)
    const errorMetrics =
      systemMetrics?.filter((m) => m.metric_name?.includes("error_rate")) || [];
    const responseTimeMetrics =
      systemMetrics?.filter((m) => m.metric_name?.includes("response_time")) ||
      [];
    const uptimeMetrics =
      systemMetrics?.filter((m) => m.metric_name?.includes("uptime")) || [];

    // Calculate average response time
    const avgResponseTime =
      responseTimeMetrics.length > 0
        ? responseTimeMetrics.reduce(
            (sum, metric) => sum + (metric.metric_value || 0),
            0,
          ) / responseTimeMetrics.length
        : 0;

    // Calculate error rate
    const currentErrorRate =
      errorMetrics.length > 0 ? errorMetrics[0]?.metric_value || 0 : 0;

    // Calculate uptime percentage
    const currentUptime =
      uptimeMetrics.length > 0 ? uptimeMetrics[0]?.metric_value || 99.9 : 99.9;

    // Get recent user sessions for activity monitoring
    const { count: activeSessions } = await supabase
      .from("user_sessions")
      .select("*", { count: "exact", head: true })
      .gte("session_start", twentyFourHoursAgo)
      .is("session_end", null);

    // System health status
    let healthStatus = "healthy";
    if (currentErrorRate > 5 || currentUptime < 99.0) {
      healthStatus = "degraded";
    }
    if (currentErrorRate > 10 || currentUptime < 95.0) {
      healthStatus = "unhealthy";
    }

    const systemHealth = {
      status: healthStatus,
      uptime: currentUptime,
      errorRate: currentErrorRate,
      avgResponseTime: avgResponseTime,
      database: {
        status: "connected", // Assume healthy if we can query
        totalUsers: totalUsers || 0,
        totalMfaEntries: totalMfaEntries || 0,
        totalLeads: totalLeads || 0,
      },
      activeUsers: {
        currentSessions: activeSessions || 0,
      },
      alerts: {
        unresolved: systemAlerts?.length || 0,
        critical:
          systemAlerts?.filter((a) => a.severity === "critical").length || 0,
        high: systemAlerts?.filter((a) => a.severity === "high").length || 0,
        medium:
          systemAlerts?.filter((a) => a.severity === "medium").length || 0,
        low: systemAlerts?.filter((a) => a.severity === "low").length || 0,
      },
      metrics: {
        lastUpdated: systemMetrics?.[0]?.created_at || new Date().toISOString(),
        totalMetrics: systemMetrics?.length || 0,
      },
    };

    return NextResponse.json({
      systemHealth,
      recentAlerts: systemAlerts?.slice(0, 10) || [],
      recentMetrics: systemMetrics?.slice(0, 20) || [],
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
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
    const { action, alertId, metricName, metricValue, metricType, tags } = body;

    if (action === "acknowledge_alert" && alertId) {
      // Acknowledge an alert
      const { error: updateError } = await supabase
        .from("system_alerts")
        .update({
          acknowledged: true,
          acknowledged_by: user.id,
          acknowledged_at: new Date().toISOString(),
        })
        .eq("id", alertId);

      if (updateError) {
        console.error("Error acknowledging alert:", updateError);
        return NextResponse.json(
          { error: "Failed to acknowledge alert" },
          { status: 500 },
        );
      }

      // Log admin action
      await supabase.from("admin_actions").insert({
        admin_id: user.id,
        action_type: "acknowledge_alert",
        target_id: alertId,
        target_type: "alert",
        description: "Acknowledged system alert",
      });

      return NextResponse.json({ success: true });
    } else if (action === "resolve_alert" && alertId) {
      // Resolve an alert
      const { error: updateError } = await supabase
        .from("system_alerts")
        .update({
          resolved: true,
          resolved_by: user.id,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", alertId);

      if (updateError) {
        console.error("Error resolving alert:", updateError);
        return NextResponse.json(
          { error: "Failed to resolve alert" },
          { status: 500 },
        );
      }

      // Log admin action
      await supabase.from("admin_actions").insert({
        admin_id: user.id,
        action_type: "resolve_alert",
        target_id: alertId,
        target_type: "alert",
        description: "Resolved system alert",
      });

      return NextResponse.json({ success: true });
    } else if (
      action === "add_metric" &&
      metricName &&
      metricValue !== undefined
    ) {
      // Add a manual system metric
      const { error: insertError } = await supabase
        .from("system_metrics")
        .insert({
          metric_name: metricName,
          metric_value: metricValue,
          metric_type: metricType || "gauge",
          tags: tags || {},
        });

      if (insertError) {
        console.error("Error adding metric:", insertError);
        return NextResponse.json(
          { error: "Failed to add metric" },
          { status: 500 },
        );
      }

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Invalid action or missing parameters" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
