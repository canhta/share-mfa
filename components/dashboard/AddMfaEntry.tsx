"use client";

import { useState } from "react";

import { InView } from "@/components/motion-primitives/in-view";
import {
  Button,
  Card,
  FormInput,
  SectionHeader,
  StatusMessage,
} from "@/components/ui";

interface AddMfaEntryProps {
  onAdd: () => void;
}

export default function AddMfaEntry({ onAdd }: AddMfaEntryProps) {
  const [name, setName] = useState("");
  const [secret, setSecret] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !secret.trim()) {
      setError("Name and secret are required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/mfa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          secret: secret.trim(),
          notes: notes.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error adding MFA entry:", data.error);
        // Handle specific error cases
        if (response.status === 401) {
          setError(
            "You must be logged in to add MFA entries. Please refresh the page and try again.",
          );
        } else if (response.status === 400) {
          setError(data.error || "Invalid input data");
        } else {
          setError(data.error || "Failed to add MFA entry. Please try again.");
        }
        return;
      }

      // Reset form on success
      setName("");
      setSecret("");
      setNotes("");
      onAdd();
    } catch (err) {
      console.error("Error adding MFA entry:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <InView
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1 },
      }}
              transition={{ duration: 0.33, ease: "easeOut" }}
      viewOptions={{ once: true }}
    >
      <Card variant="elevated" className="mb-8">
        <SectionHeader
          title="Add New MFA Entry"
          description="Add a new TOTP-based authenticator entry to your collection."
          titleSize="md"
          animated={false}
          className="mb-6"
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Service Name"
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., GitHub, Google, AWS"
              required
              description="The name of the service or application"
            />

            <FormInput
              label="Secret Key"
              id="secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter the TOTP secret key"
              required
              description="The secret key provided by the service"
            />
          </div>

          <FormInput
            label="Notes (Optional)"
            id="notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes about this entry"
            description="Any additional information about this MFA entry"
          />

          {error && (
            <StatusMessage variant="error" onClose={() => setError("")}>
              {error}
            </StatusMessage>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              disabled={!name.trim() || !secret.trim()}
              className="rounded-xl"
            >
              Add MFA Entry
            </Button>
          </div>
        </form>
      </Card>
    </InView>
  );
}
