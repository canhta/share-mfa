"use client";

import {
  ArrowUpRight,
  Calendar,
  CreditCard,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

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

interface BillingInfoProps {
  profile: UserProfile;
}

export default function BillingInfo({ profile }: BillingInfoProps) {
  const planDetails = {
    free: {
      name: "Free",
      price: "$0",
      features: ["Up to 5 MFA entries", "Basic sharing", "Community support"],
    },
    pro: {
      name: "Pro",
      price: "$9.99",
      features: [
        "Unlimited MFA entries",
        "Advanced sharing options",
        "Priority support",
        "Custom domains",
      ],
    },
    enterprise: {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Everything in Pro",
        "Team management",
        "Advanced analytics",
        "Custom integrations",
        "Dedicated support",
      ],
    },
  };

  const currentPlan = planDetails[profile.user_tier];

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Current Plan</h3>
          </div>
          {profile.user_tier === "free" && (
            <Link href="/billing">
              <Button variant="primary" size="sm">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                Upgrade
              </Button>
            </Link>
          )}
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold text-gray-900">
                {currentPlan.name} Plan
              </h4>
              <p className="text-lg text-gray-600">
                {currentPlan.price}
                {profile.user_tier !== "free" && "/month"}
              </p>
              {profile.subscription_status && (
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                    profile.subscription_status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {profile.subscription_status}
                </span>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {profile.available_credits}
              </div>
              <div className="text-sm text-gray-600">Available Credits</div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h5 className="text-sm font-medium text-gray-900 mb-2">
            Plan Features
          </h5>
          <ul className="space-y-1">
            {currentPlan.features.map((feature, index) => (
              <li
                key={index}
                className="text-sm text-gray-600 flex items-center"
              >
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Usage Statistics */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">
            Usage Statistics
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="w-4 h-4 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {profile.available_credits}
                </p>
                <p className="text-xs text-gray-600">Available Credits</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {profile.total_credits_earned}
                </p>
                <p className="text-xs text-gray-600">Total Earned</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-600">Member Since</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Billing History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Billing History
            </h3>
          </div>
          <Link href="/billing">
            <Button variant="outline" size="sm">
              View Full History
            </Button>
          </Link>
        </div>

        {profile.user_tier === "free" ? (
          <div className="text-center py-8 text-gray-500">
            <p>No billing history available for free plan</p>
            <p className="text-sm mt-1">
              Upgrade to Pro to see billing details
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Pro Plan</p>
                <p className="text-sm text-gray-600">Monthly subscription</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">$9.99</p>
                <p className="text-sm text-gray-600">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Plan Management */}
      {profile.user_tier !== "free" && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Plan Management
          </h3>
          <div className="space-y-3">
            <Link href="/billing">
              <Button variant="outline" className="w-full sm:w-auto">
                Manage Subscription
              </Button>
            </Link>
            <p className="text-sm text-gray-600">
              Change your plan, update payment methods, or view detailed billing
              information.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
