"use client";

import { AlertCircle, Building, Mail, Save, Target, User } from "lucide-react";
import { useState } from "react";

import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormInput from "@/components/ui/FormInput";

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

interface ProfileFormProps {
  profile: UserProfile;
  onUpdate: (profile: Partial<UserProfile>) => void;
}

export default function ProfileForm({ profile, onUpdate }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    display_name: profile.display_name || "",
    company: profile.company || "",
    use_case: profile.use_case || "personal",
    newsletter_consent: profile.newsletter_consent,
    product_updates_consent: profile.product_updates_consent,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const updatedProfile = await response.json();
      onUpdate(updatedProfile.profile);
      setSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    return (
      formData.display_name !== (profile.display_name || "") ||
      formData.company !== (profile.company || "") ||
      formData.use_case !== profile.use_case ||
      formData.newsletter_consent !== profile.newsletter_consent ||
      formData.product_updates_consent !== profile.product_updates_consent
    );
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Profile Information
        </h3>
        <p className="text-sm text-gray-600">
          Update your personal information and preferences.
        </p>
      </div>

      {success && (
        <Alert variant="success" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          Profile updated successfully!
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Display Name */}
        <div>
          <div className="flex items-center mb-2">
            <User className="w-4 h-4 text-gray-400 mr-2" />
            <label className="text-sm font-medium text-gray-700">
              Display Name
            </label>
          </div>
          <FormInput
            id="display-name"
            label="Display Name"
            placeholder="How should we address you?"
            value={formData.display_name}
            onChange={(e) => handleInputChange("display_name", e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Company */}
        <div>
          <div className="flex items-center mb-2">
            <Building className="w-4 h-4 text-gray-400 mr-2" />
            <label className="text-sm font-medium text-gray-700">
              Company/Organization
            </label>
          </div>
          <FormInput
            id="company"
            label="Company"
            placeholder="Your company or organization"
            value={formData.company}
            onChange={(e) => handleInputChange("company", e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Use Case */}
        <div>
          <div className="flex items-center mb-2">
            <Target className="w-4 h-4 text-gray-400 mr-2" />
            <label className="text-sm font-medium text-gray-700">
              Primary Use Case
            </label>
          </div>
          <select
            value={formData.use_case}
            onChange={(e) => handleInputChange("use_case", e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          >
            <option value="personal">Personal use</option>
            <option value="business">Business use</option>
            <option value="team">Team collaboration</option>
          </select>
        </div>

        {/* Communication Preferences */}
        <div>
          <div className="flex items-center mb-4">
            <Mail className="w-4 h-4 text-gray-400 mr-2" />
            <label className="text-sm font-medium text-gray-700">
              Communication Preferences
            </label>
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.product_updates_consent}
                onChange={(e) =>
                  handleInputChange("product_updates_consent", e.target.checked)
                }
                disabled={loading}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">
                Product updates and security notifications
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.newsletter_consent}
                onChange={(e) =>
                  handleInputChange("newsletter_consent", e.target.checked)
                }
                disabled={loading}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">
                Newsletter with tips and feature announcements
              </span>
            </label>
          </div>
        </div>

        {/* Account Info (Read-only) */}
        <div className="pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            Account Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Plan:</span>
              <span className="ml-2 font-medium capitalize">
                {profile.user_tier}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Available Credits:</span>
              <span className="ml-2 font-medium">
                {profile.available_credits}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Total Credits Earned:</span>
              <span className="ml-2 font-medium">
                {profile.total_credits_earned}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Member Since:</span>
              <span className="ml-2 font-medium">
                {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button
            type="submit"
            disabled={loading || !hasChanges()}
            className="flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
