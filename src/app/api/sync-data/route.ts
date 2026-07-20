/**
 * GET /api/sync?username=X
 * GET /api/sync?username=X&mode=mentor
 *
 * Triggered by the user's own browser on page load (BackgroundSync component).
 * Fetches fresh PR data from GitHub → saves to Supabase.
 * Returns { synced: true } if new data was fetched, { synced: false } if data was fresh.
 *
 * Throttle: won't re-sync if last_synced_at < 30 minutes ago.
 * Stampede lock: DB timestamp blocks concurrent syncs for same user.
 */
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { runGitHubSync } from "@/lib/pr-tracker";
import { runMentorGitHubSync } from "@/lib/mentor-tracker";

export const dynamic = "force-dynamic";

const USERNAME_RE = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

/** Minimum gap between syncs (30 minutes) */
const SYNC_INTERVAL_MS = 30 * 60 * 1000;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("username")?.trim().replace(/^@/, "") ?? "";
  const isMentor = searchParams.get("mode") === "mentor";

  // Input validation
  if (!raw || !USERNAME_RE.test(raw)) {
    return NextResponse.json({ synced: false, error: "Invalid username" }, { status: 400 });
  }

  const username = raw.toLowerCase();

  // If Supabase is not configured, can't sync
  if (!supabase) {
    return NextResponse.json({ synced: false, error: "No database" }, { status: 503 });
  }

  const dbKey = isMentor ? `mentor:${username}` : username;

  // Check when this user was last synced
  const { data: userRow } = await supabase
    .from("users")
    .select("last_synced_at")
    .eq("github_login", dbKey)
    .single();

  const lastSynced = userRow?.last_synced_at ? new Date(userRow.last_synced_at) : null;
  const msSinceLast = lastSynced ? Date.now() - lastSynced.getTime() : Infinity;

  // If data is fresh enough, skip the sync
  if (msSinceLast < SYNC_INTERVAL_MS) {
    return NextResponse.json({ synced: false, reason: "fresh", age_minutes: Math.round(msSinceLast / 60000) });
  }

  // Data is stale — run a full GitHub sync
  try {
    if (isMentor) {
      await runMentorGitHubSync(username);
    } else {
      const baseQ = `type:pr author:${username} label:"gssoc:approved"`;
      await runGitHubSync(username, baseQ, null);
    }

    // Bust the Next.js cache so router.refresh() gets fresh data
    const pagePath = isMentor ? `/mentor/${username}` : `/pr-tracker/${username}`;
    revalidatePath(pagePath);

    // Also update visited_at
    void supabase
      .from("users")
      .update({ visited_at: new Date().toISOString() })
      .eq("github_login", isMentor ? `mentor:${username}` : username);

    return NextResponse.json({ synced: true });
  } catch (err: any) {
    const msg: string = err?.message ?? "Unknown error";
    console.error(`[sync] Failed for ${dbKey}:`, msg);

    // Return 200 with synced:false so the client doesn't retry aggressively
    return NextResponse.json({ synced: false, error: msg });
  }
}
