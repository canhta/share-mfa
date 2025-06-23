"use client";

import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl";
  padding?: "none" | "sm" | "md" | "lg";
  background?: "default" | "neutral" | "white";
}

export default function PageLayout({
  children,
  className = "",
  maxWidth = "7xl",
  padding = "lg",
  background = "neutral",
}: PageLayoutProps) {
  const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "7xl": "max-w-7xl",
  };

  const paddings = {
    none: "px-0 py-0",
    sm: "px-4 sm:px-6 py-4",
    md: "px-4 sm:px-6 lg:px-8 py-6",
    lg: "px-4 sm:px-6 lg:px-8 py-8",
  };

  const backgrounds = {
    default: "",
    neutral: "bg-gradient-neutral bg-neutral-texture",
    white: "bg-white",
  };

  return (
    <div className={cn("min-h-screen", backgrounds[background], className)}>
      <div className={cn("mx-auto", maxWidths[maxWidth], paddings[padding])}>
        {children}
      </div>
    </div>
  );
}
