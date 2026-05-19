import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { readRepoJSON, writeRepoJSON } from "@/lib/github-file";

export interface Subscriber {
  github: string;
  email: string;
  frequency: "on-change" | "daily";
  token: string;
  addedAt: string;
  lastScore: number | null;
  lastRank: number | null;
  lastChecked: string | null;
}

const SUBSCRIBERS_FILE = "data/subscribers.json";
const MAX_SUBSCRIBERS  = 500;

export async function POST(req: NextRequest) {
  let body: { github?: string; email?: string; frequency?: string };
  try {
    body = await req.json() as { github?: string; email?: string; frequency?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const github    = (body.github ?? "").trim().replace(/^@/, "");
  const email     = (body.email  ?? "").trim().toLowerCase();
  const frequency = body.frequency === "daily" ? "daily" : "on-change";

  // Basic validation
  if (!github) return NextResponse.json({ error: "GitHub username is required" }, { status: 400 });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  // Verify GitHub username exists
  const ghRes = await fetch(`https://api.github.com/users/${encodeURIComponent(github)}`, {
    headers: { Accept: "application/vnd.github.v3+json" },
  });
  if (!ghRes.ok) {
    return NextResponse.json({ error: `GitHub user "@${github}" not found` }, { status: 400 });
  }

  // Read current subscribers
  const { data: subscribers, sha } = await readRepoJSON<Subscriber[]>(SUBSCRIBERS_FILE, []);

  // Check limits
  if (subscribers.length >= MAX_SUBSCRIBERS) {
    return NextResponse.json({ error: "Subscriber limit reached. Try again later." }, { status: 503 });
  }

  // Check duplicate (by github OR email)
  const alreadyExists = subscribers.some(
    s => s.github.toLowerCase() === github.toLowerCase() || s.email === email
  );
  if (alreadyExists) {
    return NextResponse.json({ error: "This GitHub account or email is already subscribed" }, { status: 409 });
  }

  const newSub: Subscriber = {
    github,
    email,
    frequency,
    token:       randomBytes(20).toString("hex"),
    addedAt:     new Date().toISOString(),
    lastScore:   null,
    lastRank:    null,
    lastChecked: null,
  };

  const updated = [...subscribers, newSub];
  const ok = await writeRepoJSON(
    SUBSCRIBERS_FILE,
    updated,
    sha,
    `feat: subscribe ${github} (${frequency})`
  );

  if (!ok) {
    return NextResponse.json({ error: "Failed to save subscription. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, github, frequency });
}
