"use client";

import { BarChart3, Shield, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  mfaEntriesCreated: number;
  shareLinksGenerated: number;
  unreadAlerts: number;
  systemHealth: string;
}

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    mfaEntriesCreated: number;
    shareLinksGenerated: number;
  };
  userAnalytics: {
    tierDistribution: {
      free: number;
      pro: number;
      enterprise: number;
    };
  };
  leadAnalytics: {
    total: number;
    new: number;
    contacted: number;
    converted: number;
  };
  revenueAnalytics: {
    totalRevenue: number;
    subscriptions: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    mfaEntriesCreated: 0,
    shareLinksGenerated: 0,
    unreadAlerts: 0,
    systemHealth: "healthy",
  });
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch analytics data
        const analyticsResponse = await fetch("/api/admin/analytics");
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          setAnalytics(analyticsData);

          // Update stats from analytics
          setStats((prev) => ({
            ...prev,
            totalUsers: analyticsData.overview.totalUsers,
            activeUsers: analyticsData.overview.activeUsers,
            mfaEntriesCreated: analyticsData.overview.mfaEntriesCreated,
            shareLinksGenerated: analyticsData.overview.shareLinksGenerated,
          }));
        }

        // Fetch system health
        const systemResponse = await fetch("/api/admin/system");
        if (systemResponse.ok) {
          const systemData = await systemResponse.json();
          setStats((prev) => ({
            ...prev,
            systemHealth: systemData.systemHealth.status,
            unreadAlerts: systemData.systemHealth.alerts.unresolved,
          }));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-gray-300 rounded"></div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      name: "Total Users",
      stat: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      name: "Active Users",
      stat: stats.activeUsers.toLocaleString(),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      name: "MFA Entries",
      stat: stats.mfaEntriesCreated.toLocaleString(),
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      name: "System Health",
      stat: stats.systemHealth,
      icon: BarChart3,
      color:
        stats.systemHealth === "healthy" ? "text-green-600" : "text-red-600",
      bgColor: stats.systemHealth === "healthy" ? "bg-green-100" : "bg-red-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Admin Dashboard
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your ShareMFA platform performance and health.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.name}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-md ${item.bgColor}`}>
                      <IconComponent className={`h-6 w-6 ${item.color}`} />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {item.name}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {item.stat}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Grid */}
      {analytics && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* User Tier Distribution */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                User Tier Distribution
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Free</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {analytics.userAnalytics.tierDistribution.free}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pro</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {analytics.userAnalytics.tierDistribution.pro}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Enterprise</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {analytics.userAnalytics.tierDistribution.enterprise}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Lead Pipeline */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Lead Pipeline
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Leads</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {analytics.leadAnalytics.total}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {analytics.leadAnalytics.new}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Contacted</span>
                  <span className="text-sm font-semibold text-yellow-600">
                    {analytics.leadAnalytics.contacted}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Converted</span>
                  <span className="text-sm font-semibold text-green-600">
                    {analytics.leadAnalytics.converted}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Summary */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Revenue Overview
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <span className="text-lg font-semibold text-gray-900">
                    ${analytics.revenueAnalytics.totalRevenue.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Active Subscriptions
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {analytics.revenueAnalytics.subscriptions}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">System Health</span>
                  <span
                    className={`text-sm font-semibold ${
                      stats.systemHealth === "healthy"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stats.systemHealth.charAt(0).toUpperCase() +
                      stats.systemHealth.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Unresolved Alerts
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      stats.unreadAlerts > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {stats.unreadAlerts}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="/admin/users"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="text-sm font-medium text-gray-900">
                Manage Users
              </h4>
              <p className="text-xs text-gray-500">
                View and manage user accounts
              </p>
            </a>
            <a
              href="/admin/leads"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
              <h4 className="text-sm font-medium text-gray-900">
                Review Leads
              </h4>
              <p className="text-xs text-gray-500">Follow up on new leads</p>
            </a>
            <a
              href="/admin/analytics"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="h-8 w-8 text-purple-600 mb-2" />
              <h4 className="text-sm font-medium text-gray-900">
                View Analytics
              </h4>
              <p className="text-xs text-gray-500">Detailed platform metrics</p>
            </a>
            <a
              href="/admin/system"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Shield className="h-8 w-8 text-red-600 mb-2" />
              <h4 className="text-sm font-medium text-gray-900">
                System Health
              </h4>
              <p className="text-xs text-gray-500">Monitor system status</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
