"use client";

import { Activity, CreditCard, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";

import { InView } from "@/components/motion-primitives/in-view";
import { LoadingSpinner } from "@/components/ui";
import Card from "@/components/ui/Card";

import ActivityLog from "./ActivityLog";
import BillingInfo from "./BillingInfo";
import ProfileForm from "./ProfileForm";
import SecuritySettings from "./SecuritySettings";

interface UserProfile {
  id: string;
  display_name: string | null;
  company: string | null;
  use_case: "personal" | "business" | "team" | null;
  newsletter_consent: boolean;
  product_updates_consent: boolean;
  user_tier: "free" | "pro" | "enterprise";
  subscription_status: string | null;
  available_credits: number;
  total_credits_earned: number;
  created_at: string;
  updated_at: string;
}

type TabType = "profile" | "security" | "billing" | "activity";

export default function ProfileManagement() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      setProfile(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile: Partial<UserProfile>) => {
    if (profile) {
      setProfile({ ...profile, ...updatedProfile });
    }
  };

  const tabs = [
    {
      id: "profile" as TabType,
      name: "Profile",
      icon: User,
      description: "Personal information and preferences",
    },
    {
      id: "security" as TabType,
      name: "Security",
      icon: Shield,
      description: "Account security and authentication",
    },
    {
      id: "billing" as TabType,
      name: "Billing",
      icon: CreditCard,
      description: "Subscription and billing information",
    },
    {
      id: "activity" as TabType,
      name: "Activity",
      icon: Activity,
      description: "Account activity and usage history",
    },
  ];

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center text-red-600">
          <p className="text-lg font-medium">Error loading profile</p>
          <p className="text-sm mt-2">{error}</p>
          <button
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-600">
          <p>No profile data found</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <InView
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.27, ease: "easeOut" }}
        viewOptions={{ once: true }}
      >
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Account Settings
            </h2>
            <div className="mt-3 sm:mt-0">
              <span
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  profile.user_tier === "pro"
                    ? "bg-blue-100 text-blue-800"
                    : profile.user_tier === "enterprise"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {profile.user_tier.charAt(0).toUpperCase() +
                  profile.user_tier.slice(1)}{" "}
                Plan
              </span>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </Card>
      </InView>

      {/* Tab Content */}
      <InView
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.33, delay: 0.067, ease: "easeOut" }}
        viewOptions={{ once: true }}
      >
        {activeTab === "profile" && (
          <ProfileForm profile={profile} onUpdate={handleProfileUpdate} />
        )}
        {activeTab === "security" && <SecuritySettings />}
        {activeTab === "billing" && <BillingInfo profile={profile} />}
        {activeTab === "activity" && <ActivityLog />}
      </InView>
    </div>
  );
}
