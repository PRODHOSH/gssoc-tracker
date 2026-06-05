#!/usr/bin/env tsx
/**
 * GSSoC Progress Tracker — Sync Script
 *
 * Run by GitHub Actions every 6 hours.
 * 1. Fetches the full GSSoC leaderboard once
 * 2. Updates PRODHOSH's profile/history snapshots (existing behaviour)
 * 3. Loops through all subscribers — sends email if score/rank changed (or --daily)
 * 4. Updates lastScore/lastRank/lastChecked per subscriber
 * 5. Commits all data changes back to the repo
 *
 * Usage:
 *   npx tsx scripts/sync.ts           # Regular sync
 *   npx tsx scripts/sync.ts --daily   # Regular sync + daily digest for all subscribers
 */

import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { buildChangeAlertHTML, buildDailyDigestHTML } from "./email-templates";

// ── Config ─────────────────────────────────────────────────────
const GITHUB_ID       = "PRODHOSH";
const GSSOC_API       = "https://gssoc.girlscript.org/api/leaderboard";
const DATA_DIR        = path.join(process.cwd(), "data");
const PROFILE_FILE    = path.join(DATA_DIR, "profile.json");
const HISTORY_FILE    = path.join(DATA_DIR, "history.json");
const NOTIFY_FILE     = path.join(DATA_DIR, "notifications.json");
const SUBSCRIBERS_FILE = path.join(DATA_DIR, "subscribers.json");
const DAILY_MODE      = process.argv.includes("--daily");
const FETCH_TIMEOUT   = 120_000;
const APP_URL         = process.env.APP_URL ?? "https://gssoc-tracker.vercel.app";

// ── Types ──────────────────────────────────────────────────────
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

interface Subscriber {
  github: string;
  email: string;
  frequency: "on-change" | "daily";
  token: string;
  addedAt: string;
  lastScore: number | null;
  lastRank: number | null;
  lastChecked: string | null;
}

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
  accepted_roles?: string[];
  tech_stack?: string[];
  tracks?: string[];
  breakdown?: ScoreBreakdown[];
  [key: string]: unknown;
}

// ── File I/O ───────────────────────────────────────────────────
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
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf-8");
  } catch (e) {
    console.error(`❌ Failed to write ${file}:`, (e as Error).message);
  }
}

// ── GSSoC API — fetch entire leaderboard once ──────────────────
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPage(url: string): Promise<{ results: RawParticipant[]; rateLimited: boolean }> {
  const MAX_RETRIES = 4;
  let attempt = 0;

  while (attempt <= MAX_RETRIES) {
    const ac    = new AbortController();
    const timer = setTimeout(() => ac.abort(), FETCH_TIMEOUT);
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "GSSoC-Tracker/1.0" },
        signal: ac.signal,
      });

      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get("Retry-After") ?? "0", 10);
        const wait = retryAfter > 0 ? retryAfter * 1000 : Math.min(10_000 * 2 ** attempt, 120_000);
        console.warn(`  ⚠️  Rate limited (429) — waiting ${Math.round(wait / 1000)}s before retry ${attempt + 1}/${MAX_RETRIES}…`);
        clearTimeout(timer);
        await sleep(wait);
        attempt++;
        continue;
      }

      if (!res.ok) {
        console.warn(`  ⚠️  HTTP ${res.status} on ${url} — skipping page`);
        return { results: [], rateLimited: false };
      }

      let raw: unknown;
      try {
        raw = await res.json();
      } catch {
        console.warn(`  ⚠️  JSON parse error on ${url} — skipping page`);
        return { results: [], rateLimited: false };
      }

      const results: RawParticipant[] = Array.isArray(raw)
        ? (raw as RawParticipant[])
        : ((raw as { participants?: RawParticipant[] }).participants ?? []);
      return { results, rateLimited: false };
    } catch (e) {
      const msg = (e as Error).message ?? String(e);
      const isTimeout = msg.includes("abort") || msg.includes("timeout") || msg.includes("AbortError");
      if (isTimeout && attempt < MAX_RETRIES) {
        const wait = Math.min(5_000 * 2 ** attempt, 60_000);
        console.warn(`  ⚠️  Timeout on ${url} — waiting ${Math.round(wait / 1000)}s before retry ${attempt + 1}/${MAX_RETRIES}…`);
        await sleep(wait);
        attempt++;
        continue;
      }
      console.warn(`  ⚠️  Network error on ${url}: ${msg} — skipping page`);
      return { results: [], rateLimited: false };
    } finally {
      clearTimeout(timer);
    }
  }

  console.warn(`  ⚠️  Giving up on ${url} after ${MAX_RETRIES} retries — rate limit not lifting`);
  return { results: [], rateLimited: true };
}


function toSnapshot(p: RawParticipant): ProfileSnapshot {
  return {
    timestamp:      new Date().toISOString(),
    rank:           p.rank ?? 0,
    score:          p.score ?? 0,
    role_scores:    p.roleScores ?? {},
    name:           p.full_name ?? p.github_user ?? "Unknown",
    github_id:      p.github_user ?? "",
    avatar_url:     p.github_user ? `https://avatars.githubusercontent.com/${p.github_user}` : "",
    college:        p.college ?? "",
    city:           p.city ?? "",
    accepted_roles: p.accepted_roles ?? [],
    tracks:         p.tracks ?? [],
    tech_stack:     p.tech_stack ?? [],
    breakdown:      p.breakdown ?? [],
    linkedin_url:   p.linkedin_url,
  };
}

// ── Email ──────────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) { console.warn("⚠️  SMTP not configured — skipping email"); return false; }
  try {
    const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
    await transporter.sendMail({ from: `GSSoC Tracker <${user}>`, to, subject, html });
    console.log(`📧 Sent to ${to}: ${subject}`);
    return true;
  } catch (e) {
    console.error(`❌ Email failed to ${to}:`, (e as Error).message);
    return false;
  }
}

// ── Main ───────────────────────────────────────────────────────
async function main() {
  ensure();
  console.log(`\n🚀 GSSoC Tracker Sync — ${DAILY_MODE ? "Daily Digest" : "Regular"} mode\n`);

  const existing    = readJson<ProfileSnapshot | null>(PROFILE_FILE, null);
  const history     = readJson<HistoryEntry[]>(HISTORY_FILE, []);
  const notifs      = readJson<NotificationLog[]>(NOTIFY_FILE, []);
  const subscribers = readJson<Subscriber[]>(SUBSCRIBERS_FILE, []);
  const ownerEmail  = process.env.NOTIFY_EMAIL ?? process.env.SMTP_USER;

  const subByGithub = new Map(subscribers.map(s => [s.github.toLowerCase(), s]));
  const updatedSubs = new Map(subscribers.map(s => [s.github.toLowerCase(), { ...s }]));
  const remaining   = new Set<string>([GITHUB_ID.toLowerCase(), ...subscribers.map(s => s.github.toLowerCase())]);

  const newNotifs:  NotificationLog[] = [];
  let rawOwner:     RawParticipant | null = null;
  let totalFetched  = 0;

  const PAGE_SIZE  = 100;
  const PAGE_DELAY = 1200; // conservative — stays well under API rate limit
  const fetchedPages = new Set<number>();

  // ── Process one page of results — email immediately on find ───
  async function processResults(results: RawParticipant[]) {
    totalFetched += results.length;
    for (const p of results) {
      const id = (p.github_user ?? "").toLowerCase();
      if (!remaining.has(id)) continue;
      remaining.delete(id);

      if (id === GITHUB_ID.toLowerCase()) {
        rawOwner = p;
        const snap         = toSnapshot(p);
        const hasExisting  = existing !== null;
        const scoreChanged = hasExisting && snap.score !== existing.score;
        const rankChanged  = hasExisting && snap.rank  !== existing.rank;
        const hasChanges   = !hasExisting || scoreChanged || rankChanged;
        console.log(`\n[${GITHUB_ID}] Found rank #${snap.rank} — score ${existing?.score ?? "–"} → ${snap.score}`);
        writeJson(PROFILE_FILE, snap);
        if (hasChanges) {
          history.push({ timestamp: snap.timestamp, rank: snap.rank, score: snap.score, role_scores: snap.role_scores,
            rank_change: existing ? snap.rank - existing.rank : 0, score_change: existing ? snap.score - existing.score : 0 });
          writeJson(HISTORY_FILE, history);
        }
        try {
          if (ownerEmail && hasChanges && hasExisting && (scoreChanged || rankChanged)) {
            const scoreDiff = snap.score - existing!.score;
            const subject   = `GSSoC Alert: Score ${scoreDiff >= 0 ? "+" : ""}${scoreDiff} pts · Rank #${snap.rank}`;
            const sent      = await sendEmail(ownerEmail, subject, buildChangeAlertHTML({ curr: snap, prev: existing! }));
            newNotifs.push({ timestamp: new Date().toISOString(), type: "change_alert", subject, email_sent: sent,
              changes: { rank_before: existing!.rank, rank_after: snap.rank, score_before: existing!.score, score_after: snap.score } });
          }
          if (ownerEmail && DAILY_MODE) {
            const week = history.slice(-28), oldest = week[0];
            const subject = `GSSoC Daily: Score ${snap.score.toLocaleString()} pts · Rank #${snap.rank}`;
            const sent    = await sendEmail(ownerEmail, subject, buildDailyDigestHTML({ profile: snap, history_count: history.length,
              score_7d: oldest ? snap.score - oldest.score : 0, rank_7d: oldest ? oldest.rank - snap.rank : 0 }));
            newNotifs.push({ timestamp: new Date().toISOString(), type: "daily_digest", subject, email_sent: sent });
          }
        } catch (e) {
          console.error(`  ❌ [${GITHUB_ID}] Email step failed:`, (e as Error).message);
        }
        continue;
      }

      const sub      = subByGithub.get(id);
      if (!sub) continue;
      const snap     = toSnapshot(p);
      const unsubUrl = `${APP_URL}/api/unsubscribe?token=${sub.token}`;
      const scChanged = sub.lastScore !== null && snap.score !== sub.lastScore;
      const rkChanged = sub.lastRank  !== null && snap.rank  !== sub.lastRank;
      console.log(`\n  ✅ [${sub.github}] Found rank #${snap.rank}, score ${snap.score}`);
      try {
        if (sub.frequency === "on-change" && (scChanged || rkChanged)) {
          const scoreDiff = snap.score - (sub.lastScore ?? snap.score);
          const subject   = `GSSoC Alert: Score ${scoreDiff >= 0 ? "+" : ""}${scoreDiff} pts · Rank #${snap.rank}`;
          await sendEmail(sub.email, subject, buildChangeAlertHTML({ curr: snap,
            prev: { rank: sub.lastRank ?? snap.rank, score: sub.lastScore ?? snap.score, role_scores: {} }, unsubscribeUrl: unsubUrl }));
          console.log(`  [${sub.github}] 📧 Change alert sent (${sub.lastScore} → ${snap.score})`);
        } else if (DAILY_MODE && sub.frequency === "daily") {
          const subject = `GSSoC Daily: ${snap.score.toLocaleString()} pts · Rank #${snap.rank}`;
          await sendEmail(sub.email, subject, buildDailyDigestHTML({ profile: snap, history_count: history.length,
            score_7d: 0, rank_7d: 0, unsubscribeUrl: unsubUrl }));
          console.log(`  [${sub.github}] 📧 Daily digest sent`);
        } else {
          console.log(`  [${sub.github}] No change — no email needed`);
        }
      } catch (e) {
        console.error(`  ❌ [${sub.github}] Email step failed:`, (e as Error).message);
      }
      updatedSubs.set(id, { ...sub, lastScore: snap.score, lastRank: snap.rank, lastChecked: new Date().toISOString() });
    }
  }

  async function fetchAndProcess(pg: number, label: string): Promise<boolean> {
    if (fetchedPages.has(pg)) return true;
    if (fetchedPages.size > 0) await sleep(PAGE_DELAY);
    fetchedPages.add(pg);
    const { results, rateLimited } = await fetchPage(`${GSSOC_API}?page=${pg}&limit=${PAGE_SIZE}`);
    if (rateLimited) { console.warn(`\n⚠️  Rate limited on ${label} page ${pg} — emails sent for all profiles found so far`); return false; }
    if (results.length === 0) return true;
    await processResults(results);
    const still = remaining.size > 0 ? [...remaining].join(", ") : "none ✅";
    console.log(`  ${label} page ${pg}: total=${totalFetched} — still need: ${still}`);
    return true;
  }

  // ── Phase 1: targeted pages (jump straight to expected rank) ──
  // Uses lastRank from saved data — avoids scanning from page 1 every time.
  // Buffer of ±3 pages handles rank drift between syncs.
  const RANK_BUFFER = 3;
  const knownRanks  = new Map<string, number>();
  if (existing?.rank) knownRanks.set(GITHUB_ID.toLowerCase(), existing.rank);
  for (const sub of subscribers) {
    if (sub.lastRank) knownRanks.set(sub.github.toLowerCase(), sub.lastRank);
  }

  const targetPages = new Set<number>([1]);
  for (const [id, rank] of knownRanks) {
    if (!remaining.has(id)) continue;
    const ep = Math.ceil(rank / PAGE_SIZE);
    for (let p = Math.max(1, ep - RANK_BUFFER); p <= ep + RANK_BUFFER; p++) targetPages.add(p);
  }

  let rateLimitHit = false;

  console.log(`📡 Phase 1 — targeted pages: [${[...targetPages].sort((a,b)=>a-b).join(", ")}]`);
  for (const pg of [...targetPages].sort((a, b) => a - b)) {
    if (remaining.size === 0 || rateLimitHit) break;
    if (!await fetchAndProcess(pg, "targeted")) { rateLimitHit = true; }
  }

  // ── Phase 2: sequential scan for any remaining profiles ────────
  // Covers two cases:
  //   a) Unknown-rank subscribers (lastRank = null, never synced before)
  //   b) Known-rank profiles that moved far beyond their ±3 page buffer
  if (!rateLimitHit && remaining.size > 0) {
    console.log(`\n📡 Phase 2 — sequential scan for remaining: [${[...remaining].join(", ")}]`);
    let seqPg    = 1;
    const MAX_SEQ = 100; // top 10 000 participants — if not found here they're not yet active
    let seqCount  = 0;
    while (!rateLimitHit && remaining.size > 0 && seqCount < MAX_SEQ) {
      if (!fetchedPages.has(seqPg)) {
        if (!await fetchAndProcess(seqPg, "sequential")) { rateLimitHit = true; break; }
        seqCount++;
      }
      seqPg++;
    }
  }

  if (totalFetched === 0) console.warn("⚠️  No data fetched — API may be down");
  if (!rawOwner && existing) console.warn(`⚠️  ${GITHUB_ID} not found — keeping last saved data`);

  for (const id of remaining) {
    if (id === GITHUB_ID.toLowerCase()) continue;
    const sub = subByGithub.get(id);
    if (sub) console.log(`  [${sub.github}] Not found after scanning ${totalFetched} participants — likely no merged PRs yet`);
  }

  if (newNotifs.length) writeJson(NOTIFY_FILE, [...notifs, ...newNotifs]);
  if (subscribers.length > 0) writeJson(SUBSCRIBERS_FILE, [...updatedSubs.values()]);
  console.log(`\n✅ Sync complete — ${totalFetched} participants scanned, ${fetchedPages.size} page(s) fetched`);
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
