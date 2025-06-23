"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

import { InView } from "@/components/motion-primitives/in-view";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  titleSize?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
}

export default function SectionHeader({
  title,
  description,
  children,
  className = "",
  titleSize = "lg",
  animated = true,
}: SectionHeaderProps) {
  const titleSizes = {
    sm: "text-lg font-semibold",
    md: "text-xl font-semibold",
    lg: "text-2xl font-semibold",
    xl: "text-3xl sm:text-4xl font-bold",
  };

  const Content = () => (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          {animated ? (
            <TextEffect
              per="word"
              preset="slide"
              className={cn(titleSizes[titleSize], "text-gray-900")}
              speedReveal={1.2}
            >
              {title}
            </TextEffect>
          ) : (
            <h2 className={cn(titleSizes[titleSize], "text-gray-900")}>
              {title}
            </h2>
          )}

          {description && (
            <>
              {animated ? (
                <TextEffect
                  per="word"
                  preset="fade-in-blur"
                  delay={0.3}
                  className="text-muted-foreground leading-relaxed max-w-2xl"
                >
                  {description}
                </TextEffect>
              ) : (
                <p className="text-muted-foreground leading-relaxed max-w-2xl">
                  {description}
                </p>
              )}
            </>
          )}
        </div>

        {children && (
          <motion.div
            initial={animated ? { opacity: 0, x: 20 } : false}
            animate={animated ? { opacity: 1, x: 0 } : false}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </div>
  );

  if (animated) {
    return (
      <InView
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewOptions={{ once: true }}
      >
        <Content />
      </InView>
    );
  }

  return <Content />;
}
