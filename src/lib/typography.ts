export const TYPOGRAPHY = {
  fontFamily: {
    sans: "var(--font-family-sans)",
    alt: "var(--font-family-alt)",
    inter: "var(--font-family-inter)",
    mono: "var(--font-geist-mono)",
  },
  weight: {
    regular: 500,
    strong: 700,
  },
  letterSpacing: {
    heading: "-0.05em",
    body: "0.025em",
    caption: "0.025em",
  },
} as const;

export type TypographyConfig = typeof TYPOGRAPHY;
