import { NextRequest, NextResponse } from "next/server";
import { buildMentorTrackerData } from "@/lib/mentor-tracker";

export const dynamic = "force-dynamic";

const USERNAME_RE = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("username")?.trim().replace(/^@/, "") ?? "";

  if (!raw) return NextResponse.json({ error: "username is required" }, { status: 400 });
  if (!USERNAME_RE.test(raw))
    return NextResponse.json({ error: "Invalid GitHub username" }, { status: 400 });

  try {
    const data = await buildMentorTrackerData(raw);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "USER_NOT_FOUND")
      return NextResponse.json({ error: "GitHub user not found" }, { status: 404 });
    if (msg === "RATE_LIMITED")
      return NextResponse.json({ error: "GitHub rate limit reached. Try again later." }, { status: 429 });
    return NextResponse.json({ error: "Failed to fetch mentor data" }, { status: 500 });
  }
}

