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

function changeAlertHTML(prev: ProfileSnapshot, curr: ProfileSnapshot): string {
  const scoreDiff = curr.score - prev.score;
  const rankDiff  = prev.rank - curr.rank; // positive = improved
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;background:#fafafa;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:540px;margin:32px auto;background:#fff;border:1px solid #dfdfdf;border-radius:12px;overflow:hidden;">
  <div style="background:#1c1c1c;padding:24px 28px;">
    <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.35);font-weight:600;letter-spacing:.1em;text-transform:uppercase;">GSSoC Tracker · Change Alert</p>
    <h1 style="margin:0;font-size:20px;font-weight:600;color:#fff;">Your points just updated!</h1>
  </div>
  <div style="padding:20px 28px;border-bottom:1px solid #ededed;display:flex;gap:12px;">
    <div style="flex:1;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px;">
      <p style="margin:0 0 2px;font-size:11px;color:#707070;">Score</p>
      <p style="margin:0;font-size:24px;font-weight:700;color:#24b47e;font-family:monospace;">${curr.score.toLocaleString()}</p>
      <p style="margin:4px 0 0;font-size:12px;color:${scoreDiff >= 0 ? "#166534" : "#9f1239"};">${scoreDiff >= 0 ? "+" : ""}${scoreDiff} pts</p>
    </div>
    <div style="flex:1;background:#fafafa;border:1px solid #dfdfdf;border-radius:8px;padding:14px;">
      <p style="margin:0 0 2px;font-size:11px;color:#707070;">Rank</p>
      <p style="margin:0;font-size:24px;font-weight:700;color:#171717;font-family:monospace;">#${curr.rank}</p>
      <p style="margin:4px 0 0;font-size:12px;color:${rankDiff > 0 ? "#166534" : rankDiff < 0 ? "#9f1239" : "#707070"};">
        ${rankDiff > 0 ? `↑ ${rankDiff} places` : rankDiff < 0 ? `↓ ${Math.abs(rankDiff)} places` : "No change"}
      </p>
    </div>
  </div>
  ${Object.keys(curr.role_scores).length ? `
  <div style="padding:16px 28px;border-bottom:1px solid #ededed;">
    <p style="margin:0 0 10px;font-size:11px;color:#707070;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">By Role</p>
    ${Object.entries(curr.role_scores).map(([r, pts]) =>
      `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #efefef;">
        <span style="font-size:13px;color:#171717;">${r.charAt(0).toUpperCase() + r.slice(1)}</span>
        <span style="font-size:13px;font-weight:700;font-family:monospace;color:#24b47e;">${pts.toLocaleString()} pts</span>
      </div>`).join("")}
  </div>` : ""}
  <div style="padding:14px 28px;background:#fafafa;">
    <p style="margin:0;font-size:11px;color:#9a9a9a;">@${curr.github_id} · ${new Date(curr.timestamp).toLocaleString("en-IN")}</p>
  </div>
</div></body></html>`;
}

function digestHTML(curr: ProfileSnapshot, history: HistoryEntry[]): string {
  const week = history.slice(-28); // last 7 days × 4 checks/day
  const oldest = week[0];
  const scoreDiff = oldest ? curr.score - oldest.score : 0;
  const rankDiff  = oldest ? oldest.rank - curr.rank : 0;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;background:#fafafa;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:540px;margin:32px auto;background:#fff;border:1px solid #dfdfdf;border-radius:12px;overflow:hidden;">
  <div style="background:#1c1c1c;padding:24px 28px;">
    <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.35);font-weight:600;letter-spacing:.1em;text-transform:uppercase;">GSSoC Tracker · Daily Digest</p>
    <h1 style="margin:0;font-size:20px;font-weight:600;color:#fff;">Good morning, ${curr.name.split(" ")[0]}! ☀️</h1>
    <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.4);">${new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}</p>
  </div>
  <div style="padding:20px 28px;border-bottom:1px solid #ededed;display:flex;gap:12px;">
    <div style="flex:1;text-align:center;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px;">
      <p style="margin:0 0 2px;font-size:11px;color:#707070;">Total Score</p>
      <p style="margin:0;font-size:24px;font-weight:700;color:#24b47e;font-family:monospace;">${curr.score.toLocaleString()}</p>
    </div>
    <div style="flex:1;text-align:center;background:#fafafa;border:1px solid #dfdfdf;border-radius:8px;padding:14px;">
      <p style="margin:0 0 2px;font-size:11px;color:#707070;">Rank</p>
      <p style="margin:0;font-size:24px;font-weight:700;color:#171717;font-family:monospace;">#${curr.rank}</p>
    </div>
  </div>
  <div style="padding:16px 28px;border-bottom:1px solid #ededed;background:#fafafa;">
    <p style="margin:0 0 10px;font-size:11px;color:#707070;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">7-Day Summary</p>
    <div style="display:flex;gap:20px;">
      <div>
        <p style="margin:0 0 2px;font-size:11px;color:#9a9a9a;">Points gained</p>
        <p style="margin:0;font-size:18px;font-weight:700;font-family:monospace;color:${scoreDiff >= 0 ? "#24b47e" : "#9f1239"};">${scoreDiff >= 0 ? "+" : ""}${scoreDiff}</p>
      </div>
      <div>
        <p style="margin:0 0 2px;font-size:11px;color:#9a9a9a;">Rank change</p>
        <p style="margin:0;font-size:18px;font-weight:700;font-family:monospace;color:${rankDiff > 0 ? "#24b47e" : rankDiff < 0 ? "#9f1239" : "#707070"};">
          ${rankDiff > 0 ? `↑ ${rankDiff}` : rankDiff < 0 ? `↓ ${Math.abs(rankDiff)}` : "—"}
        </p>
      </div>
      <div>
        <p style="margin:0 0 2px;font-size:11px;color:#9a9a9a;">Snapshots</p>
        <p style="margin:0;font-size:18px;font-weight:700;font-family:monospace;color:#171717;">${history.length}</p>
      </div>
    </div>
  </div>
  <div style="padding:14px 28px;background:#fafafa;">
    <p style="margin:0;font-size:11px;color:#9a9a9a;">@${curr.github_id} · GSSoC 2026 Progress Tracker</p>
  </div>
</div></body></html>`;
}

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
    const subject  = `GSSoC Alert: Score ${current.score > (existing?.score ?? 0) ? "+" : ""}${current.score - (existing?.score ?? 0)} pts · Rank #${current.rank}`;
    const html     = changeAlertHTML(existing!, current);
    const sent     = await sendEmail(subject, html);
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
    const subject = `GSSoC Daily: Score ${current.score.toLocaleString()} pts · Rank #${current.rank}`;
    const html    = digestHTML(current, history);
    const sent    = await sendEmail(subject, html);
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
