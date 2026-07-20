/**
 * POST /api/cron/sync-users
 * Called by GitHub Actions every 15 minutes.
 * Fetches all users who visited in the last 24 hours and syncs their PRs from GitHub.
 *
 * Protected by CRON_SECRET env var.
 * Paces syncs at 2 seconds apart to stay well under the GitHub API rate limit.
 */
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { runGitHubSync } from "@/lib/pr-tracker";
import { runMentorGitHubSync } from "@/lib/mentor-tracker";

const PACE_MS = 2000; // 2s between each user = max 30 req/min well under limit

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: NextRequest) {
  // Auth: require CRON_SECRET
  const secret = req.headers.get("authorization");
  const expected = process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : null;
  if (expected && secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json({ error: "No Supabase connection" }, { status: 500 });
  }

  // Query users who visited in the last 24 hours, AND haven't been synced in the last 30 minutes
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  
  const { data: activeUsers, error } = await supabase
    .from("users")
    .select("github_login")
    .gte("visited_at", since)
    .or(`last_synced_at.lt.${thirtyMinsAgo},last_synced_at.is.null`);

  if (error) {
    console.error("[cron] Failed to fetch active users:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const users = (activeUsers ?? []).map((u) => u.github_login);
  console.log(`[cron] Found ${users.length} active users to sync`);

  return NextResponse.json({ users });
}
