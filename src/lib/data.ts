/**
 * Server-side data access — reads local JSON files.
 * These files are committed to the repo and updated by GitHub Actions.
 */
import fs from "fs";
import path from "path";
import { ProfileSnapshot, HistoryEntry, NotificationLog } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");

function readJson<T>(filename: string, fallback: T): T {
  try {
    const file = path.join(DATA_DIR, filename);
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

export function getProfile(): ProfileSnapshot | null {
  return readJson<ProfileSnapshot | null>("profile.json", null);
}

export function getHistory(): HistoryEntry[] {
  return readJson<HistoryEntry[]>("history.json", []);
}

export function getNotifications(): NotificationLog[] {
  return readJson<NotificationLog[]>("notifications.json", []);
}

/** Derived: rank change from last history entry vs current profile */
export function getLatestChange(
  profile: ProfileSnapshot | null,
  history: HistoryEntry[]
): { rank_change: number; score_change: number } {
  if (!profile || history.length < 2) return { rank_change: 0, score_change: 0 };
  const prev = history[history.length - 2];
  const curr = history[history.length - 1];
  return {
    rank_change: curr.rank - prev.rank,   // negative = improved
    score_change: curr.score - prev.score, // positive = gained
  };
}
