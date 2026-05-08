#!/usr/bin/env tsx
/**
 * GSSoC Progress Tracker — Sync Script
 *
 * Run by GitHub Actions every 6 hours.
 * 1. Fetches PRODHOSH's profile from the GSSoC API
 * 2. Compares with the last stored snapshot
 * 3. If changed: updates profile.json, appends to history.json, sends alert email
 * 4. If --daily flag: always sends a digest email
 * 5. Commits data changes back to the repo
 *
 * Usage:
 *   npx tsx scripts/sync.ts           # Regular sync (change alert only)
 *   npx tsx scripts/sync.ts --daily   # Regular sync + daily digest email
 */

import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { buildChangeAlertHTML, buildDailyDigestHTML } from "./email-templates";

// ── Config ────────────────────────────────────────────────────
const GITHUB_ID     = "PRODHOSH";
const GSSOC_API     = "https://gssoc.girlscript.org/api/leaderboard";
const DATA_DIR      = path.join(process.cwd(), "data");
const PROFILE_FILE  = path.join(DATA_DIR, "profile.json");
const HISTORY_FILE  = path.join(DATA_DIR, "history.json");
const NOTIFY_FILE   = path.join(DATA_DIR, "notifications.json");
const DAILY_MODE    = process.argv.includes("--daily");
const FETCH_TIMEOUT = 120_000; // 2 min — API returns ~10 MB

// ── Types ─────────────────────────────────────────────────────
interface ScoreBreakdown { label: string; pts: number; role: string }

interface ProfileSnapshot {
  timestamp: string;
  rank: number;
  score: number;
  role_scores: Record<string, number>;
  name: string;
  github_id: string;
  avatar_url: string;
  college: string;
  city: string;
  accepted_roles: string[];
  tracks: string[];
  tech_stack: string[];
  breakdown: ScoreBreakdown[];
  linkedin_url?: string;
}

interface HistoryEntry {
  timestamp: string;
  rank: number;
  score: number;
  role_scores: Record<string, number>;
  rank_change: number;
  score_change: number;
}

interface NotificationLog {
  timestamp: string;
  type: "change_alert" | "daily_digest";
  subject: string;
  email_sent: boolean;
  changes?: { rank_before: number; rank_after: number; score_before: number; score_after: number };
}

// ── File I/O ──────────────────────────────────────────────────
function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson<T>(file: string, fallback: T): T {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
  } catch { return fallback; }
}

function writeJson(file: string, data: unknown) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

// ── GSSoC API ─────────────────────────────────────────────────
interface RawParticipant {
  full_name?: string;
  github_user?: string;
  github_url?: string;
  linkedin_url?: string;
  city?: string;
  college?: string;
  score?: number;
  rank?: number;
  roleScores?: Record<string, number>;
  roles?: string[];
  accepted_roles?: string[];
  tech_stack?: string[];
  tracks?: string[];
  breakdown?: ScoreBreakdown[];
  applied_at?: string;
  [key: string]: unknown;
}

async function fetchProfile(): Promise<ProfileSnapshot> {
  console.log("📡 Fetching GSSoC leaderboard…");
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), FETCH_TIMEOUT);
  try {
    const res = await fetch(GSSOC_API, {
      headers: {
        Accept: "application/json",
        "User-Agent": "GSSoC-Tracker/1.0 (personal-dashboard)",
      },
      signal: ac.signal,
    });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const raw = await res.json() as { participants?: RawParticipant[] } | RawParticipant[];

    const list: RawParticipant[] = Array.isArray(raw)
      ? raw
      : (raw as { participants?: RawParticipant[] }).participants ?? [];

    const found = list.find(
      p => (p.github_user ?? "").toLowerCase() === GITHUB_ID.toLowerCase()
    );
    if (!found) throw new Error(`Profile ${GITHUB_ID} not found in API response`);

    console.log(`✅ Found profile: ${found.full_name} (rank #${found.rank})`);
    return {
      timestamp:     new Date().toISOString(),
      rank:          found.rank ?? 0,
      score:         found.score ?? 0,
      role_scores:   found.roleScores ?? {},
      name:          found.full_name ?? GITHUB_ID,
      github_id:     found.github_user ?? GITHUB_ID,
      avatar_url:    found.github_user
                       ? `https://avatars.githubusercontent.com/${found.github_user}`
                       : "",
      college:       found.college ?? "",
      city:          found.city ?? "",
      accepted_roles: found.accepted_roles ?? [],
      tracks:        found.tracks ?? [],
      tech_stack:    found.tech_stack ?? [],
      breakdown:     found.breakdown ?? [],
      linkedin_url:  found.linkedin_url,
    };
  } finally {
    clearTimeout(timer);
  }
}

// ── Email ─────────────────────────────────────────────────────
async function sendEmail(subject: string, html: string): Promise<boolean> {
  const user  = process.env.SMTP_USER;
  const pass  = process.env.SMTP_PASS;
  const to    = process.env.NOTIFY_EMAIL ?? user;
  if (!user || !pass || !to) {
    console.warn("⚠️  Email env vars not set — skipping email");
    return false;
  }
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
    await transporter.sendMail({
      from: `"GSSoC Tracker 🏆" <${user}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent: ${subject}`);
    return true;
  } catch (e) {
    console.error("❌ Email failed:", (e as Error).message);
    return false;
  }
}

// (email templates moved to email-templates.ts)

// ── Main ──────────────────────────────────────────────────────
async function main() {
  ensure();
  console.log(`🚀 GSSoC Tracker Sync — ${DAILY_MODE ? "Daily Digest" : "Regular"} mode`);

  const existing = readJson<ProfileSnapshot | null>(PROFILE_FILE, null);
  const history  = readJson<HistoryEntry[]>(HISTORY_FILE, []);
  const notifs   = readJson<NotificationLog[]>(NOTIFY_FILE, []);

  // Fetch current data
  let current: ProfileSnapshot;
  try {
    current = await fetchProfile();
  } catch (e) {
    console.error("❌ Fetch failed:", (e as Error).message);
    process.exit(1);
  }

  // Detect changes
  const hasExisting  = existing !== null;
  const scoreChanged = hasExisting && current.score !== existing.score;
  const rankChanged  = hasExisting && current.rank !== existing.rank;
  const hasChanges   = !hasExisting || scoreChanged || rankChanged;

  console.log(`📊 Score: ${existing?.score ?? "–"} → ${current.score}`);
  console.log(`📊 Rank:  #${existing?.rank ?? "–"} → #${current.rank}`);
  console.log(`🔄 Changes detected: ${hasChanges}`);

  // Always update profile.json
  writeJson(PROFILE_FILE, current);

  // Append to history if data changed (or first run)
  if (hasChanges) {
    const entry: HistoryEntry = {
      timestamp:    current.timestamp,
      rank:         current.rank,
      score:        current.score,
      role_scores:  current.role_scores,
      rank_change:  existing ? current.rank - existing.rank : 0,
      score_change: existing ? current.score - existing.score : 0,
    };
    history.push(entry);
    writeJson(HISTORY_FILE, history);
    console.log(`💾 Saved to history (${history.length} entries total)`);
  }

  const newNotifs: NotificationLog[] = [];

  // Change alert email
  if (hasChanges && hasExisting && (scoreChanged || rankChanged)) {
    const scoreDiff = current.score - existing!.score;
    const subject   = `GSSoC Alert: Score ${scoreDiff >= 0 ? "+" : ""}${scoreDiff} pts · Rank #${current.rank}`;
    const html      = buildChangeAlertHTML({ curr: current, prev: existing! });
    const sent      = await sendEmail(subject, html);
    newNotifs.push({
      timestamp: new Date().toISOString(),
      type: "change_alert",
      subject,
      email_sent: sent,
      changes: {
        rank_before:  existing!.rank,
        rank_after:   current.rank,
        score_before: existing!.score,
        score_after:  current.score,
      },
    });
  }

  // Daily digest email
  if (DAILY_MODE) {
    const week       = history.slice(-28);
    const oldest     = week[0];
    const score_7d   = oldest ? current.score - oldest.score : 0;
    const rank_7d    = oldest ? oldest.rank - current.rank : 0;
    const subject    = `GSSoC Daily: Score ${current.score.toLocaleString()} pts · Rank #${current.rank}`;
    const html       = buildDailyDigestHTML({
      profile:       current,
      history_count: history.length,
      score_7d,
      rank_7d,
    });
    const sent = await sendEmail(subject, html);
    newNotifs.push({
      timestamp: new Date().toISOString(),
      type: "daily_digest",
      subject,
      email_sent: sent,
    });
  }

  if (newNotifs.length > 0) {
    writeJson(NOTIFY_FILE, [...notifs, ...newNotifs]);
  }

  console.log("✅ Sync complete");
}

main().catch(e => {
  console.error("Fatal:", e);
  process.exit(1);
});
