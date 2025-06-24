"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface IconButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "ghost" | "outline" | "destructive";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  title?: string;
  type?: "button" | "submit" | "reset";
}

export default function IconButton({
  children,
  onClick,
  variant = "default",
  size = "md",
  className = "",
  disabled = false,
  loading = false,
  title,
  type = "button",
}: IconButtonProps) {
  const variants = {
    default: [
      "bg-gray-50/80 hover:bg-gray-100/80",
      "border border-gray-200/60 hover:border-gray-300/60",
      "text-gray-600 hover:text-gray-800",
    ],
    ghost: [
      "bg-transparent hover:bg-gray-100/60",
      "text-gray-400 hover:text-gray-600",
    ],
    outline: [
      "bg-transparent hover:bg-gray-50/80",
      "border border-gray-300 hover:border-gray-400",
      "text-gray-600 hover:text-gray-800",
    ],
    destructive: [
      "bg-transparent hover:bg-gray-100/60",
      "text-gray-400 hover:text-gray-600",
    ],
  };

  const sizes = {
    sm: "h-6 w-6 p-1",
    md: "h-8 w-8 p-1.5",
    lg: "h-10 w-10 p-2",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className={cn(
        "inline-flex items-center justify-center",
        "rounded-lg transition-all duration-150",
        "focus-ring-neutral",
        "disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      {loading ? (
        <motion.div
          className={cn(
            "border-2 border-current border-t-transparent rounded-full",
            iconSizes[size],
          )}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      ) : (
        <div className={iconSizes[size]}>{children}</div>
      )}
    </motion.button>
  );
}
