/**
 * POST /api/cron/sync-single-user
 * Called by GitHub Actions in a loop to sync a single user, avoiding Vercel 10s timeouts.
 */
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { runGitHubSync } from "@/lib/pr-tracker";
import { runMentorGitHubSync } from "@/lib/mentor-tracker";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("authorization");
  const expected = process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : null;
  if (expected && secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json({ error: "No Supabase connection" }, { status: 500 });
  }

  try {
    const { user } = await req.json();
    if (!user || typeof user !== "string") {
      return NextResponse.json({ error: "Invalid user parameter" }, { status: 400 });
    }

    const isMentor = user.startsWith("mentor:");
    const username = isMentor ? user.slice(7) : user;

    if (isMentor) {
      await runMentorGitHubSync(username);
    } else {
      const baseQ = `type:pr author:${username} label:"gssoc:approved"`;
      await runGitHubSync(username, baseQ, null);
    }

    return NextResponse.json({ ok: true, user });
  } catch (err: any) {
    console.error(`[cron-single] Error syncing ${req.url}:`, err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
