import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username")?.trim();
  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  const token = process.env.GH_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers });
    if (res.status === 404) {
      return NextResponse.json({ error: "GitHub user not found" }, { status: 404 });
    }
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch user from GitHub" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
