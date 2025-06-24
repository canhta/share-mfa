'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { InView } from '@/components/motion-primitives/in-view';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { Button, Card } from '@/components/ui';
import type { MfaEntry } from '@/types/database';

export default function MfaEntrySummary() {
  const [entries, setEntries] = useState<MfaEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/mfa');
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Error fetching MFA entries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <InView
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1 },
      }}
      transition={{ duration: 0.33, ease: 'easeOut' }}
      viewOptions={{ once: true }}
    >
      <Card hover variant="elevated" padding="lg" className="transition-all duration-150">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <TextEffect per="word" preset="slide" className="text-xl font-semibold text-slate-900 mb-1">
                MFA Codes
              </TextEffect>
              <div className="text-sm text-slate-600">
                {entries.length} {entries.length === 1 ? 'code' : 'codes'} configured
              </div>
            </div>
            <Link href="/mfa">
              <Button variant="primary" size="md" className="rounded-xl">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Manage MFA
              </Button>
            </Link>
          </div>

          {/* Content */}
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <TextEffect per="word" preset="slide" className="text-base font-medium text-slate-900 mb-2">
                No MFA codes yet
              </TextEffect>
              <TextEffect per="word" preset="fade-in-blur" delay={0.3} className="text-sm text-slate-600 mb-4">
                Add your first MFA code to get started
              </TextEffect>
              <Link href="/mfa">
                <Button variant="outline" size="md" className="rounded-xl">
                  Add Your First Code
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Quick preview of first few entries */}
              {entries.slice(0, 3).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
                      <svg className="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{entry.name}</div>
                      {entry.notes && <div className="text-sm text-slate-600 truncate max-w-xs">{entry.notes}</div>}
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">Active</div>
                </div>
              ))}

              {entries.length > 3 && (
                <div className="text-center pt-2">
                  <Link href="/mfa">
                    <Button variant="ghost" size="sm" className="text-slate-600">
                      View {entries.length - 3} more codes
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </InView>
  );
}
