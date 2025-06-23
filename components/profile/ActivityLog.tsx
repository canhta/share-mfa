"use client";

import { Activity, Calendar, Eye, Lock, RefreshCw, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

import { LoadingSpinner } from "@/components/ui";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface ActivityItem {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

export default function ActivityLog() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivityLog();
  }, []);

  const fetchActivityLog = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/activity");
      if (!response.ok) {
        throw new Error("Failed to fetch activity log");
      }
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load activity log",
      );
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "login":
        return <Eye className="w-4 h-4 text-green-600" />;
      case "mfa_created":
        return <Lock className="w-4 h-4 text-blue-600" />;
      case "mfa_shared":
        return <Share2 className="w-4 h-4 text-purple-600" />;
      case "profile_updated":
        return <Activity className="w-4 h-4 text-orange-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return time.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Activity Log Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Activity className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Recent Activity
            </h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchActivityLog}
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="text-center text-red-600 py-4">
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchActivityLog}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {!error && activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No activity yet</p>
            <p className="text-sm">Your account activity will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.description}
                  </p>
                  <div className="flex items-center mt-1 text-xs text-gray-500 space-x-4">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                    {activity.ip_address && (
                      <span>IP: {activity.ip_address}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Security Notice */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Security Notice</h4>
            <p className="text-sm text-blue-800 mt-1">
              We track important account activities for security purposes. If
              you notice any suspicious activity, please contact support
              immediately.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
