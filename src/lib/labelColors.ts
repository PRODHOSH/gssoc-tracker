import { ds } from "@/lib/ds";

export interface LabelChipColors {
  bg: string;
  color: string;
  border: string;
}

/**
 * Shared label chip colors so gssoc/level/quality/type tags look the same
 * across the PR tracker, mentor, project admin, and PR validator views.
 * Falls back to the label's GitHub API color (if provided), then a neutral style.
 */
export function getLabelChipColors(label: string, apiColor?: string): LabelChipColors {
  if (label.startsWith("gssoc"))   return { bg: "#f0fdf4", color: "#166534", border: "#86efac" };
  if (label.startsWith("level"))   return { bg: "#fdf4ff", color: "#7e22ce", border: "#d8b4fe" };
  if (label.startsWith("quality")) return { bg: "#eff6ff", color: "#1e40af", border: "#93c5fd" };
  if (label.startsWith("type"))    return { bg: "#fff7ed", color: "#c2410c", border: "#fdba74" };
  if (apiColor) return { bg: `${apiColor}22`, color: apiColor, border: apiColor };
  return { bg: ds.canvasSoft, color: ds.inkMute, border: ds.hairline };
}
