"use client";

import { AnimatePresence, motion } from "motion/react";
import { InputHTMLAttributes, useState } from "react";

import { cn } from "@/lib/utils";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  description?: string;
}

export default function FormInput({
  label,
  id,
  error,
  description,
  className = "",
  ...props
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <motion.div className="relative">
        <input
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
            "bg-white/80 backdrop-blur-sm",
            "border border-gray-300/60",
            "rounded-xl shadow-sm transition-all duration-150",
            "focus-ring-neutral focus:border-gray-500",
            "placeholder:text-gray-400",
            "hover:border-gray-400/80 hover:bg-white/90",
            error && "border-gray-400 focus:border-gray-600",
            className,
          )}
        />

        {/* Focus indicator */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-400/5 to-gray-500/5 pointer-events-none"
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
          className="text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.067 }}
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
