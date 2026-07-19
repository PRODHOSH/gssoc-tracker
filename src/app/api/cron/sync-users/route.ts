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

  // Query all users who visited in the last 24 hours
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: activeUsers, error } = await supabase
    .from("users")
    .select("github_login")
    .gte("visited_at", since);

  if (error) {
    console.error("[cron] Failed to fetch active users:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const users = activeUsers ?? [];
  console.log(`[cron] Syncing ${users.length} active users`);

  const results: { user: string; status: "ok" | "error"; error?: string }[] = [];

  for (const { github_login } of users) {
    const isMentor = github_login.startsWith("mentor:");
    const username = isMentor ? github_login.slice(7) : github_login;

    try {
      if (isMentor) {
        await runMentorGitHubSync(username);
      } else {
        const baseQ = `type:pr author:${username} label:"gssoc:approved"`;
        await runGitHubSync(username, baseQ, null);
      }
      results.push({ user: github_login, status: "ok" });
      console.log(`[cron] ✓ ${github_login}`);
    } catch (err: any) {
      results.push({ user: github_login, status: "error", error: err.message });
      console.warn(`[cron] ✗ ${github_login}:`, err.message);
    }

    // Pace: wait 2 seconds between each user
    await sleep(PACE_MS);
  }

  const ok = results.filter((r) => r.status === "ok").length;
  const failed = results.filter((r) => r.status === "error").length;

  return NextResponse.json({
    synced: ok,
    failed,
    total: users.length,
    results,
  });
}
