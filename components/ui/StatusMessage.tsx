"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface StatusMessageProps {
  children: ReactNode;
  variant?: "info" | "success" | "warning" | "error";
  className?: string;
  onClose?: () => void;
  title?: string;
}

export default function StatusMessage({
  children,
  variant = "info",
  className = "",
  onClose,
  title,
}: StatusMessageProps) {
  const variants = {
    info: {
      container:
        "bg-gray-50/80 backdrop-blur-sm border border-gray-200/60 text-gray-900",
      icon: "text-gray-500",
      iconPath: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    success: {
      container:
        "bg-gray-50/80 backdrop-blur-sm border border-gray-200/60 text-gray-900",
      icon: "text-gray-600",
      iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    warning: {
      container:
        "bg-gray-50/80 backdrop-blur-sm border border-gray-200/60 text-gray-900",
      icon: "text-gray-500",
      iconPath:
        "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z",
    },
    error: {
      container:
        "bg-gray-100/80 backdrop-blur-sm border border-gray-300/60 text-gray-800",
      icon: "text-gray-600",
      iconPath: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  };

  const config = variants[variant];

  return (
    <motion.div
      className={cn("p-4 rounded-xl shadow-sm", config.container, className)}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <svg
            className={cn("w-5 h-5 flex-shrink-0 mt-0.5", config.icon)}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={config.iconPath}
            />
          </svg>

          <div className="flex-1 min-w-0">
            {title && <h4 className="text-sm font-medium mb-1">{title}</h4>}
            <div className="text-sm">{children}</div>
          </div>
        </div>

        {onClose && (
          <motion.button
            onClick={onClose}
            className="ml-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100/60 rounded-lg transition-all duration-200 flex-shrink-0"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
