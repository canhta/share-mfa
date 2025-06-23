"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

import { InView } from "@/components/motion-primitives/in-view";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "outline";
  };
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  const defaultIcon = (
    <svg
      className="w-12 h-12 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  );

  return (
    <InView
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1 },
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      viewOptions={{ once: true }}
    >
      <div
        className={cn(
          "flex flex-col items-center justify-center py-12 px-4 text-center",
          className,
        )}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {icon || defaultIcon}
        </motion.div>

        <div className="mt-6 space-y-2">
          <TextEffect
            per="word"
            preset="slide"
            className="text-lg font-medium text-gray-900"
            speedReveal={1.3}
            delay={0.2}
          >
            {title}
          </TextEffect>

          {description && (
            <TextEffect
              per="word"
              preset="fade-in-blur"
              delay={0.4}
              className="text-muted-foreground max-w-md leading-relaxed"
            >
              {description}
            </TextEffect>
          )}
        </div>

        {action && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <Button
              onClick={action.onClick}
              variant={action.variant || "primary"}
              className="rounded-xl"
            >
              {action.label}
            </Button>
          </motion.div>
        )}
      </div>
    </InView>
  );
}
