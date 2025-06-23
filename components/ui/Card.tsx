"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  hover?: boolean;
  variant?: "default" | "elevated" | "flat" | "outline";
}

export default function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
  variant = "default",
}: CardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
    xl: "p-10",
  };

  const variantClasses = {
    default: ["surface-elevated"],
    elevated: ["glass-neutral"],
    flat: ["bg-gray-50/80 backdrop-blur-sm", "border border-gray-200/40"],
    outline: [
      "bg-transparent",
      "border-2 border-gray-300",
      "hover:bg-gray-50/50",
    ],
  };

  const MotionCard = hover ? motion.div : "div";
  const motionProps = hover
    ? {
        whileHover: {
          y: -2,
          scale: 1.02,
          transition: { duration: 0.2, ease: "easeOut" as const },
        },
        whileTap: {
          scale: 0.98,
          transition: { duration: 0.1 },
        },
      }
    : {};

  return (
    <MotionCard
      className={cn(
        "rounded-2xl transition-all duration-200",
        variantClasses[variant],
        paddingClasses[padding],
        hover && "cursor-pointer hover:shadow-lg hover:shadow-gray-200/30",
        className,
      )}
      {...motionProps}
    >
      {children}
    </MotionCard>
  );
}
