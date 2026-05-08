import nodemailer from "nodemailer";

export function createTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  const transporter = createTransport();
  await transporter.sendMail({
    from: `"GSSoC Tracker 🏆" <${process.env.SMTP_USER}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}

// ── Email templates ─────────────────────────────────────────

interface ChangeAlertData {
  name: string;
  github_id: string;
  rank_before: number;
  rank_after: number;
  score_before: number;
  score_after: number;
  role_scores: Record<string, number>;
  timestamp: string;
}

export function changeAlertHTML(d: ChangeAlertData): string {
  const rankImproved = d.rank_after < d.rank_before;
  const rankDir = rankImproved ? "🚀 Improved" : d.rank_after > d.rank_before ? "📉 Dropped" : "— No change";
  const scoreDiff = d.score_after - d.score_before;
  const rankDiff = d.rank_before - d.rank_after; // positive = improved

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border:1px solid #dfdfdf;border-radius:12px;overflow:hidden;">
    <!-- Header -->
    <div style="background:#1c1c1c;padding:28px 32px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.35);">GSSoC Progress Tracker</p>
      <h1 style="margin:0;font-size:22px;font-weight:600;color:#fff;">Points Update Detected</h1>
    </div>

    <!-- Stats -->
    <div style="padding:24px 32px;border-bottom:1px solid #ededed;">
      <div style="display:flex;gap:16px;">
        <div style="flex:1;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;">
          <p style="margin:0 0 4px;font-size:11px;color:#707070;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;">Score</p>
          <p style="margin:0;font-size:26px;font-weight:700;color:#24b47e;font-family:monospace;">${d.score_after.toLocaleString()}</p>
          <p style="margin:4px 0 0;font-size:13px;color:${scoreDiff >= 0 ? "#166534" : "#9f1239"};">
            ${scoreDiff >= 0 ? "+" : ""}${scoreDiff} pts
          </p>
        </div>
        <div style="flex:1;background:#fafafa;border:1px solid #dfdfdf;border-radius:8px;padding:16px;">
          <p style="margin:0 0 4px;font-size:11px;color:#707070;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;">Rank</p>
          <p style="margin:0;font-size:26px;font-weight:700;color:#171717;font-family:monospace;">#${d.rank_after}</p>
          <p style="margin:4px 0 0;font-size:13px;color:${rankImproved ? "#166534" : d.rank_after > d.rank_before ? "#9f1239" : "#707070"};">
            ${rankImproved ? `↑ ${rankDiff} places` : d.rank_after > d.rank_before ? `↓ ${-rankDiff} places` : "No change"}
          </p>
        </div>
      </div>
    </div>

    <!-- Role scores -->
    <div style="padding:20px 32px;border-bottom:1px solid #ededed;">
      <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#707070;letter-spacing:0.06em;text-transform:uppercase;">Score by Role</p>
      ${Object.entries(d.role_scores).map(([role, pts]) => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #efefef;">
          <span style="font-size:14px;color:#171717;font-weight:500;">${role.charAt(0).toUpperCase() + role.slice(1)}</span>
          <span style="font-size:14px;font-weight:700;font-family:monospace;color:#24b47e;">${pts.toLocaleString()} pts</span>
        </div>
      `).join("")}
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;background:#fafafa;">
      <p style="margin:0;font-size:12px;color:#9a9a9a;">
        Tracked for <strong style="color:#171717;">@${d.github_id}</strong> · ${new Date(d.timestamp).toLocaleString("en-IN")}
      </p>
      <p style="margin:8px 0 0;font-size:12px;color:#b2b2b2;">
        GSSoC 2026 Progress Tracker — Community Tool
      </p>
    </div>
  </div>
</body>
</html>`;
}

interface DigestData {
  name: string;
  github_id: string;
  rank: number;
  score: number;
  role_scores: Record<string, number>;
  rank_7d_change: number;
  score_7d_change: number;
  history_count: number;
  timestamp: string;
}

export function dailyDigestHTML(d: DigestData): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border:1px solid #dfdfdf;border-radius:12px;overflow:hidden;">
    <!-- Header -->
    <div style="background:#1c1c1c;padding:28px 32px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.35);">GSSoC Progress Tracker · Daily Digest</p>
      <h1 style="margin:0;font-size:22px;font-weight:600;color:#fff;">Good morning, ${d.name.split(" ")[0]}! ☀️</h1>
      <p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.45);">${new Date(d.timestamp).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
    </div>

    <!-- Current standing -->
    <div style="padding:24px 32px 20px;border-bottom:1px solid #ededed;">
      <p style="margin:0 0 16px;font-size:12px;font-weight:600;color:#707070;letter-spacing:0.06em;text-transform:uppercase;">Current Standing</p>
      <div style="display:flex;gap:12px;">
        <div style="flex:1;text-align:center;padding:16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
          <p style="margin:0 0 4px;font-size:11px;color:#707070;">Total Score</p>
          <p style="margin:0;font-size:24px;font-weight:700;color:#24b47e;font-family:monospace;">${d.score.toLocaleString()}</p>
        </div>
        <div style="flex:1;text-align:center;padding:16px;background:#fafafa;border:1px solid #dfdfdf;border-radius:8px;">
          <p style="margin:0 0 4px;font-size:11px;color:#707070;">Global Rank</p>
          <p style="margin:0;font-size:24px;font-weight:700;color:#171717;font-family:monospace;">#${d.rank}</p>
        </div>
      </div>
    </div>

    <!-- 7-day summary -->
    <div style="padding:20px 32px;border-bottom:1px solid #ededed;background:#fafafa;">
      <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#707070;letter-spacing:0.06em;text-transform:uppercase;">Last 7 Days</p>
      <div style="display:flex;gap:24px;">
        <div>
          <p style="margin:0 0 2px;font-size:12px;color:#9a9a9a;">Points gained</p>
          <p style="margin:0;font-size:18px;font-weight:700;color:${d.score_7d_change >= 0 ? "#24b47e" : "#9f1239"};font-family:monospace;">
            ${d.score_7d_change >= 0 ? "+" : ""}${d.score_7d_change}
          </p>
        </div>
        <div>
          <p style="margin:0 0 2px;font-size:12px;color:#9a9a9a;">Rank change</p>
          <p style="margin:0;font-size:18px;font-weight:700;color:${d.rank_7d_change <= 0 ? "#24b47e" : "#9f1239"};font-family:monospace;">
            ${d.rank_7d_change <= 0 ? `↑ ${Math.abs(d.rank_7d_change)}` : `↓ ${d.rank_7d_change}`}
          </p>
        </div>
        <div>
          <p style="margin:0 0 2px;font-size:12px;color:#9a9a9a;">Data points</p>
          <p style="margin:0;font-size:18px;font-weight:700;color:#171717;font-family:monospace;">${d.history_count}</p>
        </div>
      </div>
    </div>

    <!-- Role scores -->
    <div style="padding:20px 32px;border-bottom:1px solid #ededed;">
      <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#707070;letter-spacing:0.06em;text-transform:uppercase;">Score Breakdown</p>
      ${Object.entries(d.role_scores).map(([role, pts]) => `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #efefef;">
          <span style="font-size:14px;color:#171717;">${role.charAt(0).toUpperCase() + role.slice(1)}</span>
          <span style="font-size:14px;font-weight:600;color:#24b47e;font-family:monospace;">${pts.toLocaleString()} pts</span>
        </div>
      `).join("")}
    </div>

    <div style="padding:20px 32px;background:#fafafa;">
      <p style="margin:0;font-size:12px;color:#9a9a9a;">@${d.github_id} · GSSoC 2026 Progress Tracker</p>
    </div>
  </div>
</body>
</html>`;
}
