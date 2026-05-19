import { NextRequest, NextResponse } from "next/server";
import { readRepoJSON, writeRepoJSON } from "@/lib/github-file";
import type { Subscriber } from "@/app/api/subscribe/route";

const SUBSCRIBERS_FILE = "data/subscribers.json";

const page = (title: string, message: string, isError = false) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} · GSSoC Tracker</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #171717; font-family: 'Helvetica Neue', Arial, sans-serif;
           display: flex; align-items: center; justify-content: center;
           min-height: 100vh; padding: 24px; }
    .card { background: #1f1f1f; border: 1px solid #2a2a2a; border-radius: 14px;
            padding: 40px 36px; max-width: 420px; width: 100%; text-align: center; }
    .icon { font-size: 36px; margin-bottom: 16px; }
    h1 { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 10px; }
    p { font-size: 14px; color: rgba(255,255,255,0.45); line-height: 1.65; }
    a { display: inline-block; margin-top: 24px; padding: 10px 22px;
        background: ${isError ? "rgba(239,68,68,0.12)" : "rgba(62,207,142,0.12)"};
        border: 1px solid ${isError ? "rgba(239,68,68,0.3)" : "rgba(62,207,142,0.3)"};
        color: ${isError ? "#f87171" : "#3ecf8e"};
        border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${isError ? "⚠️" : "✅"}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/">Back to tracker</a>
  </div>
</body>
</html>`;

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";

  if (!token) {
    return new NextResponse(
      page("Invalid link", "This unsubscribe link is missing a token.", true),
      { status: 400, headers: { "Content-Type": "text/html" } }
    );
  }

  const { data: subscribers, sha } = await readRepoJSON<Subscriber[]>(SUBSCRIBERS_FILE, []);
  const match = subscribers.find(s => s.token === token);

  if (!match) {
    return new NextResponse(
      page("Already unsubscribed", "This token wasn't found — you may have already unsubscribed."),
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  }

  const updated = subscribers.filter(s => s.token !== token);
  const ok = await writeRepoJSON(
    SUBSCRIBERS_FILE,
    updated,
    sha,
    `feat: unsubscribe ${match.github}`
  );

  if (!ok) {
    return new NextResponse(
      page("Something went wrong", "We couldn't process your unsubscribe request. Please try again.", true),
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }

  return new NextResponse(
    page(
      "Unsubscribed",
      `You've been removed from GSSoC Tracker alerts. @${match.github} won't receive any more emails from us.`
    ),
    { status: 200, headers: { "Content-Type": "text/html" } }
  );
}
