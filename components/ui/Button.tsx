"use client";

import { motion } from "motion/react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const baseClasses = [
      "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white",
      "disabled:opacity-50 disabled:pointer-events-none",
      "relative overflow-hidden",
    ];

    const variants = {
      primary: [
        "bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black",
        "text-white shadow-lg shadow-gray-500/20 hover:shadow-gray-500/30",
        "focus:ring-gray-500 border border-gray-800 hover:border-gray-900",
      ],
      secondary: [
        "bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300",
        "text-gray-900 shadow-sm",
        "focus:ring-gray-400 border border-gray-200",
      ],
      outline: [
        "border-2 border-gray-300 hover:border-gray-400",
        "bg-transparent hover:bg-gray-50",
        "text-gray-700 hover:text-gray-900",
        "focus:ring-gray-400",
      ],
      ghost: [
        "bg-transparent hover:bg-gray-100",
        "text-gray-700 hover:text-gray-900",
        "focus:ring-gray-400",
      ],
      destructive: [
        "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800",
        "text-white shadow-lg shadow-gray-500/20 hover:shadow-gray-500/30",
        "focus:ring-gray-500 border border-gray-600 hover:border-gray-700",
      ],
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm h-8",
      md: "px-4 py-2 text-sm h-10",
      lg: "px-6 py-3 text-base h-12",
      icon: "h-10 w-10",
    };

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15, ease: "easeInOut" }}
      >
        <button
          ref={ref}
          className={cn(baseClasses, variants[variant], sizes[size], className)}
          disabled={disabled || loading}
          onClick={onClick}
          {...props}
        >
          {/* Subtle highlight for primary buttons */}
          {variant === "primary" && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          )}

          {loading ? (
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span>Loading...</span>
            </div>
          ) : (
            children
          )}
        </button>
      </motion.div>
    );
  },
);

Button.displayName = "Button";

export default Button;
