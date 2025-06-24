'use client';

import { useState } from 'react';

import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import CopyButton from '@/components/ui/CopyButton';
import FormInput from '@/components/ui/FormInput';
import Modal from '@/components/ui/Modal';
import ModalActions from '@/components/ui/ModalActions';
import Select from '@/components/ui/Select';
import type { MfaEntry, ShareResponse } from '@/types/database';

interface ShareModalProps {
  entry: MfaEntry;
  onClose: () => void;
}

export default function ShareModal({ entry, onClose }: ShareModalProps) {
  const [shareSettings, setShareSettings] = useState({
    requirePassword: false,
    embedPasswordInLink: false,
    password: '',
    expirationHours: 24,
  });
  const [shareData, setShareData] = useState<ShareResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/share/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mfaEntryId: entry.id,
          ...shareSettings,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setShareData(data);
      } else {
        console.error('Failed to generate share link');
      }
    } catch (error) {
      console.error('Error generating share link:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Share "${entry.name}"`} maxWidth="lg">
      {!shareData ? (
        <div className="space-y-5">
          <Alert variant="warning">
            <strong>Security Warning:</strong> Sharing MFA codes can compromise security. Only share with trusted
            individuals and use password protection.
          </Alert>

          <div className="space-y-4">
            <Checkbox
              id="requirePassword"
              label="Require password"
              checked={shareSettings.requirePassword}
              onChange={(checked) =>
                setShareSettings((prev) => ({
                  ...prev,
                  requirePassword: checked,
                }))
              }
            />

            {shareSettings.requirePassword && (
              <>
                <Checkbox
                  id="embedPassword"
                  label="Embed password in link"
                  description="Less secure but more convenient"
                  checked={shareSettings.embedPasswordInLink}
                  onChange={(checked) =>
                    setShareSettings((prev) => ({
                      ...prev,
                      embedPasswordInLink: checked,
                    }))
                  }
                />

                <FormInput
                  label="Password"
                  id="password"
                  type="password"
                  value={shareSettings.password}
                  onChange={(e) =>
                    setShareSettings((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="Enter a secure password"
                />
              </>
            )}

            <Select
              label="Expires in"
              id="expiration"
              value={shareSettings.expirationHours.toString()}
              onChange={(value) =>
                setShareSettings((prev) => ({
                  ...prev,
                  expirationHours: Number(value),
                }))
              }
              options={[
                { value: '1', label: '1 hour' },
                { value: '6', label: '6 hours' },
                { value: '24', label: '24 hours' },
                { value: '72', label: '3 days' },
                { value: '168', label: '1 week' },
              ]}
            />
          </div>

          <ModalActions>
            <Button onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleGenerateLink}
              disabled={loading || (shareSettings.requirePassword && !shareSettings.password)}
              loading={loading}
            >
              Generate Share Link
            </Button>
          </ModalActions>
        </div>
      ) : (
        <div className="space-y-5">
          <Alert variant="success">
            Share link generated successfully!
            {shareSettings.embedPasswordInLink && (
              <span className="block mt-1 font-medium">
                Warning: Password is embedded in the URL and may be visible in logs.
              </span>
            )}
          </Alert>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Share URL</label>
            <div className="flex rounded-xl shadow-sm">
              <input
                type="text"
                readOnly
                value={shareData.shareUrl}
                className="flex-1 min-w-0 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/30 border border-gray-300/60 dark:border-gray-600/30 rounded-l-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all text-sm"
              />
              <CopyButton text={shareData.shareUrl} className="rounded-l-none rounded-r-xl border-l-0" />
            </div>
          </div>

          {!shareSettings.embedPasswordInLink && shareSettings.requirePassword && (
            <Alert variant="default">
              <strong>Password:</strong> {shareSettings.password}
              <br />
              <span className="text-xs">Share this password separately for security.</span>
            </Alert>
          )}

          <ModalActions>
            <Button onClick={onClose} variant="primary">
              Close
            </Button>
          </ModalActions>
        </div>
      )}
    </Modal>
  );
}
