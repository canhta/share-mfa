'use client';

import { AlertTriangle, CheckCircle, Eye, EyeOff, Key, Shield } from 'lucide-react';
import { useState } from 'react';

import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import FormInput from '@/components/ui/FormInput';

export default function SecuritySettings() {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      setError('New passwords do not match');
      return;
    }

    if (passwords.new.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }

      setSuccess(true);
      setPasswords({ current: '', new: '', confirm: '' });
      setShowChangePassword(false);

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="space-y-6">
      {/* Account Security Overview */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <Shield className="w-5 h-5 text-green-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Account Security</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-green-900">Google SSO Authentication</p>
                <p className="text-sm text-green-700">Your account is secured with Google authentication</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Key className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-blue-900">MFA Codes</p>
                <p className="text-sm text-blue-700">Secure sharing of multi-factor authentication codes</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Password Management */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Key className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Password Management</h3>
          </div>
          {!showChangePassword && (
            <Button variant="outline" onClick={() => setShowChangePassword(true)}>
              Change Password
            </Button>
          )}
        </div>

        {success && (
          <Alert variant="success" className="mb-4">
            <CheckCircle className="h-4 w-4" />
            Password changed successfully!
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </Alert>
        )}

        {showChangePassword ? (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="relative">
              <FormInput
                id="current-password"
                label="Current Password"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwords.current}
                onChange={(e) => setPasswords((prev) => ({ ...prev, current: e.target.value }))}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <FormInput
                id="new-password"
                label="New Password"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwords.new}
                onChange={(e) => setPasswords((prev) => ({ ...prev, new: e.target.value }))}
                required
                disabled={loading}
                description="Must be at least 8 characters long"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <FormInput
                id="confirm-password"
                label="Confirm New Password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwords.confirm}
                onChange={(e) => setPasswords((prev) => ({ ...prev, confirm: e.target.value }))}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="submit" disabled={loading || !passwords.current || !passwords.new || !passwords.confirm}>
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowChangePassword(false);
                  setPasswords({ current: '', new: '', confirm: '' });
                  setError(null);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-sm text-gray-600">
            <p>{`Change your account password. You'll be logged out and need to sign in again.`}</p>
          </div>
        )}
      </Card>

      {/* Security Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Recommendations</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Use strong, unique passwords</p>
              <p className="text-sm text-gray-600">
                Your passwords should be at least 12 characters long and unique for each service.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Keep your MFA codes secure</p>
              <p className="text-sm text-gray-600">
                Only share MFA codes with trusted recipients and use password protection when needed.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Regular security reviews</p>
              <p className="text-sm text-gray-600">
                Periodically review your shared links and revoke access when no longer needed.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
