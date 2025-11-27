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
        "absolute inset-0 z-20 transition-opacity duration-150 pointer-events-none overflow-hidden",
        active ? "opacity-100" : "opacity-0",
        className
      )}
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(52,211,153,0.55) 0%, rgba(34,197,94,0.65) 35%, rgba(16,185,129,0.7) 50%, rgba(52,211,153,0.55) 75%, rgba(34,197,94,0.65) 100%)",
        backgroundSize: "240% 240%",
      }}
      animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
      transition={{ duration: 7, ease: "linear", repeat: Infinity }}
    >
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
