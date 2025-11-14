import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Utility: mask an API key as "sk-…ABCD" (show only suffix) */
export function maskKey(key?: string | null, suffix = 4) {
  if (!key) return "—";
  const vis = key.slice(-Math.max(0, Math.min(suffix, key.length)));
  return `sk-…${vis}`;
}

/** Utility: first difference index + small context window */
export function firstDiff(a: string, b: string) {
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (a[i] !== b[i]) {
      const start = Math.max(0, i - 3);
      const end = Math.min(max, i + 4);
      return {
        index: i,
        left: a.slice(start, end),
        right: b.slice(start, end),
      };
    }
  }
  return null; // identical
}

/** Utility: Levenshtein distance (iterative DP, O(mn) but small strings are fine) */
export function levenshtein(a: string, b: string) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return dp[m][n];
}

// Utility: human "time-ago" using Intl.RelativeTimeFormat.
// Handles seconds → years, past & future, and locale.
export function formatTimeAgo(input: Date | string | number, locale = "en"): string {
  const date = new Date(input);
  if (isNaN(date.getTime())) return "Invalid date";

  const now = Date.now();
  const diffMs = date.getTime() - now; // negative => past
  const absMs = Math.abs(diffMs);

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year",   365 * 24 * 60 * 60 * 1000],
    ["month",   30 * 24 * 60 * 60 * 1000], // approx
    ["week",     7 * 24 * 60 * 60 * 1000],
    ["day",      24 * 60 * 60 * 1000],
    ["hour",     60 * 60 * 1000],
    ["minute",   60 * 1000],
    ["second",   1000],
  ];

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  for (const [unit, ms] of units) {
    if (absMs >= ms || unit === "second") {
      const value = Math.round(diffMs / ms);
      return rtf.format(value, unit);
    }
  }
  // Should never hit here
  return rtf.format(0, "second");
}

// Fallback: absolute date string in the current locale.
export function formatAbsoluteDate(input: Date | string | number, locale = "en"): string {
  const date = new Date(input);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function keyOf<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}