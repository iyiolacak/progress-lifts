// src/components/FormCover.tsx
"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  active: boolean;
  label?: string;              // SR text
  className?: string;          // theme overrides
  children?: React.ReactNode;  // optional visuals (waveform, etc.)
};

export function FormCover({ active, label = "Listening…", className, children }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        "absolute inset-0 z-20 transition-opacity duration-150 pointer-events-none",
        active ? "opacity-100" : "opacity-0",
        // brand it via shadcn theme primary
        "bg-primary",
        className
      )}
    >
      {children ?? <span className="sr-only">{label}</span>}
    </div>
  );
}
