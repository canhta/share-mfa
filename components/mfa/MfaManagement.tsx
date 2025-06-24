"use client";

import { useEffect, useState } from "react";

import { InView } from "@/components/motion-primitives/in-view";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { Button, EmptyState } from "@/components/ui";
import { generateTOTP, getTimeRemaining } from "@/lib/totp";
import type { MfaEntry } from "@/types/database";

import AddMfaModal from "./AddMfaModal";
import MfaEntryCard from "./MfaEntryCard";

export default function MfaManagement() {
  const [entries, setEntries] = useState<MfaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCodes, setCurrentCodes] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchEntries = async () => {
    try {
      const response = await fetch("/api/mfa");
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
      console.error("Error fetching MFA entries:", error);
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
    setShowAddModal(false);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Action Header */}
      <InView
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.27, ease: "easeOut" }}
        viewOptions={{ once: true }}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-6 glass-neutral rounded-2xl">
          <div>
            <TextEffect
              per="word"
              preset="slide"
              className="text-xl font-semibold text-slate-900 mb-1"
            >
              Your MFA Codes
            </TextEffect>
            <div className="text-sm text-slate-600">
              {entries.length} {entries.length === 1 ? "code" : "codes"}{" "}
              configured
            </div>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            size="md"
            className="rounded-xl"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add MFA Code
          </Button>
        </div>
      </InView>

      {/* MFA Entries Grid */}
      {entries.length === 0 ? (
        <InView
          variants={{
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1 },
          }}
          transition={{ duration: 0.33, delay: 0.13, ease: "easeOut" }}
          viewOptions={{ once: true }}
        >
          <EmptyState
            icon={
              <svg
                className="h-12 w-12 text-slate-400"
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
            }
            title="No MFA codes yet"
            description="Get started by adding your first multi-factor authentication code to begin sharing securely."
            action={{
              label: "Add Your First MFA Code",
              onClick: () => setShowAddModal(true),
              variant: "primary",
            }}
          />
        </InView>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {entries.map((entry, index) => (
            <InView
              key={entry.id}
              variants={{
                hidden: { opacity: 0, y: 30, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{
                duration: 0.33,
                                  delay: 0.067 + index * 0.067,
                ease: "easeOut",
              }}
              viewOptions={{ once: true }}
            >
              <MfaEntryCard
                entry={entry}
                currentCode={currentCodes[entry.id] || "------"}
                timeRemaining={timeRemaining}
                onDelete={() => handleEntryDeleted(entry.id)}
              />
            </InView>
          ))}
        </div>
      )}

      {/* Add MFA Modal */}
      <AddMfaModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleEntryAdded}
      />
    </div>
  );
}
