/**
 * Design tokens derived verbatim from design.md (Supabase-inspired system).
 * Import `ds` in any component — never hard-code hex values.
 */
export const ds = {
  /* Surfaces */
  canvas:           "var(--color-canvas)",
  canvasSoft:       "var(--color-canvas-soft)",
  canvasNight:      "var(--color-canvas-night)",
  canvasNightSoft:  "var(--color-canvas-night-soft)",

  /* Brand — the single chromatic event */
  primary:          "var(--color-primary)",
  primaryDeep:      "var(--color-primary-deep)",

  /* Text */
  ink:              "var(--color-ink)",
  inkSecondary:     "var(--color-ink-secondary)",
  inkMute:          "var(--color-ink-mute)",
  inkMute2:         "var(--color-ink-mute2)",
  inkFaint:         "var(--color-ink-faint)",
  onPrimary:        "#171717",   // dark text ON green
  onDark:           "var(--color-on-dark)",

  /* Borders */
  hairline:         "var(--color-hairline)",
  hairlineStrong:   "var(--color-hairline-strong)",
  hairlineCool:     "var(--color-hairline-cool)",
  hairlineCool2:    "var(--color-hairline-cool2)",

  /* Radius */
  rXs:  4,
  rSm:  6,
  rMd:  8,
  rLg:  12,
  rXl:  16,
  rFull: 9999,

  /* Spacing */
  sXs:  4,
  sSm:  8,
  sMd:  12,
  sLg:  16,
  sXl:  24,
  sXxl: 32,
  sHuge: 64,

  /* Font sizes */
  fsMicro:  12,
  fsCaption: 13,
  fsButton: 14,
  fsBody:   16,
  fsHeadMd: 18,
  fsHeadLg: 22,
  fsDispMd: 28,
  fsDispLg: 36,
  fsDispXl: 48,

  /* Rank medal colours (off-brand, only for rank decoration) */
  gold:   "#ca8a04",
  silver: "#6b7280",
  bronze: "#9a5c2e",
} as const;

/** Role pill colours — monochrome tints, no brand colors */
export const ROLE_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  contributor:    { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0"  },
  ambassador:     { bg: "#fdf4ff", color: "#7e22ce", border: "#e9d5ff"  },
  mentor:         { bg: "#fffbeb", color: "#92400e", border: "#fde68a"  },
  "project-admin":{ bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe"  },
  volunteer:      { bg: "#fff1f2", color: "#9f1239", border: "#fecdd3"  },
};

/** Font stack — Circular substitute (Geist is a humanist geometric sans) */
export const fontSans = `var(--font-geist-sans), "Helvetica Neue", Arial, sans-serif`;
export const fontMono = `var(--font-geist-mono), ui-monospace, monospace`;
