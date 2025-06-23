"use client";

import { CreditCard, Gift, Star, Zap } from "lucide-react";
import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface BillingInfo {
  subscription: {
    status: string;
    plan: string;
    plan_details: {
      name: string;
      monthly_shares: number;
      features: string[];
    };
    trial_active: boolean;
    trial_days_remaining: number;
    available_credits: number;
  };
}

interface BillingDashboardProps {
  className?: string;
}

export default function BillingDashboard({
  className = "",
}: BillingDashboardProps) {
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingInfo();
  }, []);

  const fetchBillingInfo = async () => {
    try {
      const response = await fetch("/api/billing");
      if (!response.ok) {
        throw new Error("Failed to fetch billing information");
      }
      const data = await response.json();
      setBillingInfo(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load billing information",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <Card className="p-6">
          <div className="text-center text-red-600">
            <p>Failed to load billing information</p>
            <button
              onClick={fetchBillingInfo}
              className="mt-2 text-sm underline"
            >
              Try again
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (!billingInfo) {
    return null;
  }

  const { subscription } = billingInfo;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Plan */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Current Plan
            </h3>
          </div>
          {subscription.trial_active && (
            <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
              Trial Active
            </span>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">
              {subscription.plan_details.name}
            </h4>
            <p className="text-gray-600 mb-4">
              {subscription.plan_details.monthly_shares === -1
                ? "Unlimited shares per month"
                : `${subscription.plan_details.monthly_shares} shares per month`}
            </p>

            {subscription.trial_active && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-green-700">
                  <Gift className="w-4 h-4 mr-2" />
                  <span className="font-medium">
                    {subscription.trial_days_remaining} days left in trial
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h5 className="font-medium text-gray-900">Plan Features:</h5>
              <ul className="space-y-1">
                {subscription.plan_details.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center text-sm text-gray-600"
                  >
                    <Star className="w-3 h-3 mr-2 text-blue-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Available Credits
                </span>
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {subscription.available_credits}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Bonus credits from referrals and promotions
              </p>
            </div>

            {subscription.status === "free" && (
              <Button
                className="w-full"
                onClick={() => (window.location.href = "/pricing")}
              >
                Upgrade Plan
              </Button>
            )}

            {subscription.status === "active" && (
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => (window.location.href = "/pricing")}
                >
                  Change Plan
                </Button>
                <Button
                  variant="secondary"
                  className="w-full text-red-600 hover:text-red-700"
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to cancel your subscription?",
                      )
                    ) {
                      // TODO: Implement subscription cancellation
                      alert(
                        "Subscription cancellation will be implemented in the next phase.",
                      );
                    }
                  }}
                >
                  Cancel Subscription
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Upgrade Notice for Free Users */}
      {subscription.status === "free" && !subscription.trial_active && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold text-blue-900 mb-2">
                Unlock More Features
              </h4>
              <p className="text-blue-700 mb-4">
                Get more sharing capacity, advanced features, and priority
                support with our Pro plans.
              </p>
              <Button
                onClick={() => (window.location.href = "/pricing")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                View Plans
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
