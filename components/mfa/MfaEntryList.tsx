'use client';

import { useEffect, useState } from 'react';

import { TextEffect } from '@/components/motion-primitives/text-effect';
import { generateTOTP, getTimeRemaining } from '@/lib/totp';
import type { MfaEntry } from '@/types';

import AddMfaEntry from '../dashboard/AddMfaEntry';
import MfaEntryCard from './MfaEntryCard';

export default function MfaEntryList() {
  const [entries, setEntries] = useState<MfaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCodes, setCurrentCodes] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(30);

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/mfa');
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);

        // Generate initial TOTP codes
        const codes: Record<string, string> = {};
        data.entries?.forEach((entry: MfaEntry) => {
          if (entry.secret) {
            codes[entry.id] = generateTOTP(entry.secret);
          }
        });
        setCurrentCodes(codes);
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

  // Update TOTP codes and countdown timer
  useEffect(() => {
    const updateCodes = () => {
      const codes: Record<string, string> = {};
      entries.forEach((entry) => {
        if (entry.secret) {
          codes[entry.id] = generateTOTP(entry.secret);
        }
      });
      setCurrentCodes(codes);
      setTimeRemaining(getTimeRemaining());
    };

    updateCodes(); // Initial update
    const interval = setInterval(updateCodes, 1000); // Update every second

    return () => clearInterval(interval);
  }, [entries]);

  const handleEntryAdded = () => {
    fetchEntries(); // Refresh the entire list
  };

  const handleEntryDeleted = (entryId: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
    setCurrentCodes((prev) => {
      const updated = { ...prev };
      delete updated[entryId];
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="hidden sm:block">{/* Title moved to dashboard page */}</div>
        <AddMfaEntry onAdd={handleEntryAdded} />
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <svg
              className="h-12 w-12 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <TextEffect per="word" preset="slide" className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No MFA codes yet
          </TextEffect>
          <TextEffect
            per="word"
            preset="fade-in-blur"
            delay={0.3}
            className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto"
          >
            Get started by adding your first multi-factor authentication code to begin sharing securely.
          </TextEffect>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <MfaEntryCard
              key={entry.id}
              entry={entry}
              currentCode={currentCodes[entry.id] || '------'}
              timeRemaining={timeRemaining}
              onDelete={() => handleEntryDeleted(entry.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
