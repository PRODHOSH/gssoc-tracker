/**
 * POST /api/sync — manual sync for the tracked user (PRODHOSH).
 * Fetches from GSSoC, updates local JSON files.
 * Requires x-sync-secret header if SYNC_SECRET env is set.
 */
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ProfileSnapshot, HistoryEntry } from "@/types";
import { findParticipant } from "@/lib/gssoc";

const TRACKED_USER = "PRODHOSH";
const DATA_DIR     = path.join(process.cwd(), "data");

function readJson<T>(name: string, fb: T): T {
  try {
    const f = path.join(DATA_DIR, name);
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf-8")) as T : fb;
  } catch { return fb; }
}
function writeJson(name: string, data: unknown) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, name), JSON.stringify(data, null, 2), "utf-8");
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-sync-secret");
  if (process.env.SYNC_SECRET && secret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await findParticipant(TRACKED_USER);
    if (!profile) throw new Error("Profile not found in leaderboard");

    const existing = readJson<ProfileSnapshot | null>("profile.json", null);
    const history  = readJson<HistoryEntry[]>("history.json", []);
    const changed  = !existing || existing.score !== profile.score || existing.rank !== profile.rank;

    writeJson("profile.json", { ...profile, timestamp: new Date().toISOString() });

    if (changed) {
      history.push({
        timestamp:    new Date().toISOString(),
        rank:         profile.rank,
        score:        profile.score,
        role_scores:  profile.role_scores,
        rank_change:  existing ? profile.rank - existing.rank : 0,
        score_change: existing ? profile.score - existing.score : 0,
      });
      writeJson("history.json", history);
    }

    return NextResponse.json({ ok: true, score: profile.score, rank: profile.rank, changed });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
