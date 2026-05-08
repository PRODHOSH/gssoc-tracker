import { NextRequest, NextResponse } from "next/server";
import { findParticipant } from "@/lib/gssoc";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username")?.trim();
  if (!username) {
    return NextResponse.json({ error: "username is required" }, { status: 400 });
  }

  try {
    const profile = await findParticipant(username);
    if (!profile) {
      return NextResponse.json(
        { error: `@${username} was not found in the GSSoC 2026 leaderboard.` },
        { status: 404 }
      );
    }
    return NextResponse.json({ profile });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
