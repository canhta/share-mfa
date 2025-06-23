"use client";

import { AnimatePresence, motion } from "motion/react";
import { TextareaHTMLAttributes, useState } from "react";

import { cn } from "@/lib/utils";

interface FormTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  error?: string;
  description?: string;
}

export default function FormTextarea({
  label,
  id,
  error,
  description,
  className = "",
  ...props
}: FormTextareaProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <motion.div className="relative">
        <textarea
          id={id}
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={cn(
            "block w-full px-4 py-3 text-gray-900",
            "bg-white backdrop-blur-sm",
            "border border-gray-300/60",
            "rounded-xl shadow-sm transition-all duration-200",
            "focus:ring-2 focus:ring-gray-400/20 focus:border-gray-500",
            "placeholder:text-gray-400",
            "hover:border-gray-400/60",
            error &&
              "border-gray-400 focus:border-gray-600 focus:ring-gray-500/20",
            className,
          )}
        />

        {/* Focus indicator */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-400/10 to-gray-500/10 pointer-events-none"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {description && !error && (
        <motion.p
          className="text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {description}
        </motion.p>
      )}

      <AnimatePresence>
        {error && (
          <motion.p
            className="text-sm text-gray-600 flex items-center space-x-1"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
