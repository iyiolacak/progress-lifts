// src/components/FormCover.tsx
"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type Props = {
  active: boolean;
  label?: string;              // SR text
  className?: string;          // theme overrides
  children?: React.ReactNode;  // optional visuals (waveform, etc.)
};

export function FormCover({ active, label = "Listening", className, children }: Props) {
  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        "absolute bg-gray-800 inset-0 z-20 transition-opacity duration-150 pointer-events-none overflow-hidden",
        active ? "opacity-100" : "opacity-0",
        className
      )}
      style={{
        backgroundSize: "100% 100%",
      }}
    >
      {/* subtle looping overlay */}
      <motion.div
        aria-hidden
        className="absolute inset-0 z-0 opacity-35"
        style={{
          backgroundImage:
            "repeating-linear-gradient(120deg, rgba(255,255,255,0.12) 0, rgba(255,255,255,0.12) 4px, transparent 6px, transparent 12px)",
          backgroundSize: "140% 140%",
        }}
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 4, ease: "linear", repeat: Infinity }}
      />
      {children ?? (
        <div className="flex h-full w-full items-center justify-center px-4">
          <span className="sr-only">{label}</span>
          <div className="flex items-center gap-2 text-lg tracking-wide font-medium text-primary-foreground/90">
            <span>{label}</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/80 animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/70 animate-pulse [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/60 animate-pulse [animation-delay:240ms]" />
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
