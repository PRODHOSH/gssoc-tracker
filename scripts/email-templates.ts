/**
 * Email templates — design.md Supabase-inspired system.
 *
 * Canvas: #ffffff  ·  Canvas-soft: #fafafa  ·  Night: #1c1c1c
 * Primary (emerald): #3ecf8e  ·  Ink: #171717  ·  Muted: #707070
 * All inline styles for maximum email-client compatibility.
 */

// ── Shared tokens ─────────────────────────────────────────────
const C = {
  canvas:      "#ffffff",
  soft:        "#fafafa",
  night:       "#1c1c1c",
  nightSoft:   "#202020",
  primary:     "#3ecf8e",
  primaryDeep: "#24b47e",
  ink:         "#171717",
  muted:       "#707070",
  faint:       "#b2b2b2",
  hairline:    "#dfdfdf",
  hairlineCool:"#ededed",
  onDark:      "#ffffff",
  gold:        "#ca8a04",
  amber:       "#f59e0b",
};

const ROLE_COLOR: Record<string, { bg: string; color: string }> = {
  contributor:    { bg: "#f0fdf4", color: "#166534"  },
  ambassador:     { bg: "#fdf4ff", color: "#7e22ce"  },
  mentor:         { bg: "#fffbeb", color: "#92400e"  },
  "project-admin":{ bg: "#eff6ff", color: "#1e40af"  },
  volunteer:      { bg: "#fff1f2", color: "#9f1239"  },
};

type Breakdown = { label: string; pts: number; role: string };

interface Profile {
  name: string;
  github_id: string;
  avatar_url: string;
  rank: number;
  score: number;
  role_scores: Record<string, number>;
  college?: string;
  city?: string;
  accepted_roles?: string[];
  tracks?: string[];
  breakdown?: Breakdown[];
  timestamp: string;
}

// ── Helper: score delta pill ──────────────────────────────────
function delta(n: number, invertColor = false): string {
  if (n === 0) return `<span style="color:${C.faint};font-size:12px;">—</span>`;
  const up  = invertColor ? n < 0 : n > 0;
  const col = up ? C.primaryDeep : "#dc2626";
  const txt = n > 0 ? `+${n}` : `${n}`;
  return `<span style="font-size:12px;font-weight:600;font-family:monospace;color:${col};">${txt}</span>`;
}

// ── Shared header with avatar ─────────────────────────────────
function emailHeader(profile: Profile, subtitle: string): string {
  const roles = (profile.accepted_roles ?? [])
    .map(r => {
      const s = ROLE_COLOR[r] ?? { bg: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" };
      return `<span style="display:inline-block;font-size:10px;font-weight:600;padding:2px 8px;border-radius:999px;background:${s.bg};color:${s.color};margin-right:4px;">${r.charAt(0).toUpperCase() + r.slice(1)}</span>`;
    })
    .join("");

  return `
  <div style="background:${C.night};padding:28px 32px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="vertical-align:top;padding-right:16px;width:64px;">
          <img
            src="${profile.avatar_url}"
            alt="${profile.name}"
            width="60"
            height="60"
            style="border-radius:50%;display:block;border:2px solid rgba(62,207,142,0.4);"
          />
        </td>
        <td style="vertical-align:top;">
          <p style="margin:0 0 2px;font-size:11px;color:rgba(255,255,255,0.3);font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">
            GSSoC 2026 · Progress Tracker
          </p>
          <p style="margin:0 0 6px;font-size:20px;font-weight:600;color:${C.onDark};letter-spacing:-0.02em;">
            ${profile.name}
          </p>
          <div style="margin-bottom:6px;">${roles}</div>
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.35);">
            ${[profile.city, profile.college].filter(Boolean).join(" · ")}
            ${profile.city || profile.college ? " · " : ""}
            <a href="https://github.com/${profile.github_id}" style="color:rgba(255,255,255,0.35);text-decoration:none;">@${profile.github_id}</a>
          </p>
        </td>
        <td style="vertical-align:top;text-align:right;white-space:nowrap;">
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.25);">${subtitle}</p>
        </td>
      </tr>
    </table>
  </div>`;
}

// ── Score + Rank hero cards ───────────────────────────────────
function scoreRankHero(
  score: number, prevScore: number,
  rank: number,  prevRank: number
): string {
  const sc = score - prevScore;
  const rc = rank  - prevRank;   // negative = improved

  return `
  <div style="background:${C.soft};padding:20px 32px;border-bottom:1px solid ${C.hairlineCool};">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:50%;padding-right:8px;">
          <div style="background:${C.canvas};border:1px solid ${C.hairline};border-radius:10px;padding:16px 20px;">
            <p style="margin:0 0 4px;font-size:10px;font-weight:600;color:${C.muted};letter-spacing:0.08em;text-transform:uppercase;">Total Score</p>
            <p style="margin:0;font-size:28px;font-weight:700;color:${C.primaryDeep};font-family:monospace;letter-spacing:-0.02em;">
              ${score.toLocaleString()}
              <span style="font-size:13px;font-weight:400;color:${C.faint};">pts</span>
            </p>
            <div style="margin-top:6px;">${delta(sc)}</div>
          </div>
        </td>
        <td style="width:50%;padding-left:8px;">
          <div style="background:${C.canvas};border:1px solid ${C.hairline};border-radius:10px;padding:16px 20px;">
            <p style="margin:0 0 4px;font-size:10px;font-weight:600;color:${C.muted};letter-spacing:0.08em;text-transform:uppercase;">Global Rank</p>
            <p style="margin:0;font-size:28px;font-weight:700;color:${C.ink};font-family:monospace;letter-spacing:-0.02em;">
              #${rank}
            </p>
            <div style="margin-top:6px;">${delta(-rc, true)}&nbsp;
              <span style="font-size:11px;color:${C.faint};">${rc < 0 ? `↑ ${Math.abs(rc)} places` : rc > 0 ? `↓ ${rc} places` : "no change"}</span>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </div>`;
}

// ── Role score table ──────────────────────────────────────────
function roleScoreTable(role_scores: Record<string, number>): string {
  const rows = Object.entries(role_scores)
    .map(([role, pts]) => {
      const s = ROLE_COLOR[role] ?? { bg: "#f5f5f5", color: C.muted };
      return `
      <tr>
        <td style="padding:9px 0;border-bottom:1px solid ${C.hairlineCool};">
          <span style="display:inline-block;font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px;background:${s.bg};color:${s.color};">
            ${role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        </td>
        <td style="padding:9px 0;border-bottom:1px solid ${C.hairlineCool};text-align:right;font-family:monospace;font-weight:700;font-size:14px;color:${C.primaryDeep};">
          ${pts.toLocaleString()} pts
        </td>
      </tr>`;
    })
    .join("");

  return `
  <div style="padding:20px 32px;border-bottom:1px solid ${C.hairlineCool};">
    <p style="margin:0 0 12px;font-size:10px;font-weight:600;color:${C.muted};letter-spacing:0.08em;text-transform:uppercase;">Score by Role</p>
    <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
  </div>`;
}

// ── Breakdown items (grouped) ─────────────────────────────────
function breakdownSection(breakdown: Breakdown[]): string {
  if (!breakdown.length) return "";

  const groups: Record<string, Breakdown[]> = {};
  for (const b of breakdown) (groups[b.role] ??= []).push(b);

  const GROUP_LABELS: Record<string, string> = {
    general: "General Profile", contributor: "Contributor",
    ambassador: "Ambassador", mentor: "Mentor", volunteer: "Volunteer",
  };
  const GROUP_DOT: Record<string, string> = {
    general: C.faint, contributor: "#166534",
    ambassador: "#7e22ce", mentor: "#92400e", volunteer: "#9f1239",
  };

  const sections = Object.entries(groups).map(([key, items]) => {
    const total = items.reduce((s, b) => s + b.pts, 0);
    const dot   = GROUP_DOT[key] ?? C.muted;
    const rows  = items.map((b, i) => `
      <tr>
        <td style="padding:6px 10px;font-size:12px;color:${C.muted};background:${i % 2 === 0 ? C.canvas : C.soft};">${b.label}</td>
        <td style="padding:6px 10px;font-size:12px;font-weight:600;font-family:monospace;color:${b.pts > 0 ? C.primaryDeep : C.faint};background:${i % 2 === 0 ? C.canvas : C.soft};text-align:right;">
          ${b.pts > 0 ? `+${b.pts}` : b.pts}
        </td>
      </tr>`).join("");

    return `
    <div style="margin-bottom:14px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4px;">
        <tr>
          <td>
            <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${dot};margin-right:6px;vertical-align:middle;"></span>
            <span style="font-size:10px;font-weight:600;color:${C.ink};letter-spacing:0.06em;text-transform:uppercase;">${GROUP_LABELS[key] ?? key}</span>
          </td>
          <td style="text-align:right;font-size:11px;font-weight:600;font-family:monospace;color:${dot};">+${total} pts</td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.hairlineCool};border-radius:8px;overflow:hidden;">${rows}</table>
    </div>`;
  });

  return `
  <div style="padding:20px 32px;border-bottom:1px solid ${C.hairlineCool};">
    <p style="margin:0 0 14px;font-size:10px;font-weight:600;color:${C.muted};letter-spacing:0.08em;text-transform:uppercase;">Score Breakdown</p>
    ${sections.join("")}
  </div>`;
}

// ── Track pills ───────────────────────────────────────────────
function trackPills(tracks: string[]): string {
  if (!tracks.length) return "";
  const pills = tracks
    .map(t => `<span style="display:inline-block;font-size:11px;font-weight:500;padding:3px 10px;border-radius:999px;background:rgba(62,207,142,0.08);color:${C.primaryDeep};border:1px solid rgba(62,207,142,0.22);margin:0 4px 4px 0;">${t}</span>`)
    .join("");
  return `<div style="padding:16px 32px;border-bottom:1px solid ${C.hairlineCool};">${pills}</div>`;
}

// ── Footer ────────────────────────────────────────────────────
function emailFooter(github_id: string, timestamp: string): string {
  return `
  <div style="padding:16px 32px;background:${C.soft};">
    <p style="margin:0;font-size:11px;color:${C.faint};">
      <a href="https://github.com/${github_id}" style="color:${C.faint};text-decoration:none;">@${github_id}</a>
      &nbsp;·&nbsp;
      ${new Date(timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
      &nbsp;·&nbsp;
      GSSoC 2026 Progress Tracker
    </p>
  </div>`;
}

// ── Wrapper ───────────────────────────────────────────────────
function wrap(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>GSSoC Tracker</title></head>
<body style="margin:0;padding:0;background:${C.soft};font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:28px auto;background:${C.canvas};border:1px solid ${C.hairline};border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(23,23,23,0.1);">
    ${body}
  </div>
</body>
</html>`;
}

// ── Public: Change Alert ──────────────────────────────────────
export function buildChangeAlertHTML(opts: {
  curr: Profile;
  prev: { rank: number; score: number; role_scores: Record<string, number> };
}): string {
  const { curr, prev } = opts;

  const body = `
    ${emailHeader(curr, new Date(curr.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }))}

    <!-- Alert label -->
    <div style="padding:12px 32px;background:rgba(62,207,142,0.06);border-bottom:1px solid rgba(62,207,142,0.18);">
      <p style="margin:0;font-size:13px;font-weight:600;color:${C.primaryDeep};">
        ⚡ Score update detected
      </p>
    </div>

    ${scoreRankHero(curr.score, prev.score, curr.rank, prev.rank)}
    ${roleScoreTable(curr.role_scores)}
    ${trackPills(curr.tracks ?? [])}
    ${breakdownSection(curr.breakdown ?? [])}
    ${emailFooter(curr.github_id, curr.timestamp)}
  `;

  return wrap(body);
}

// ── Public: Daily Digest ──────────────────────────────────────
export function buildDailyDigestHTML(opts: {
  profile: Profile;
  history_count: number;
  score_7d: number;   // change over last 7 days
  rank_7d: number;    // change over last 7 days (negative = improved)
}): string {
  const { profile: p, history_count, score_7d, rank_7d } = opts;

  const dateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const body = `
    ${emailHeader(p, dateStr)}

    <!-- Greeting -->
    <div style="padding:16px 32px 0;background:${C.soft};">
      <p style="margin:0;font-size:16px;font-weight:600;color:${C.ink};">
        Good morning, ${p.name.split(" ")[0]}! ☀️
      </p>
      <p style="margin:4px 0 16px;font-size:13px;color:${C.muted};">Here&apos;s your GSSoC progress summary.</p>
    </div>

    ${scoreRankHero(p.score, p.score - score_7d, p.rank, p.rank - rank_7d)}

    <!-- 7-day summary bar -->
    <div style="padding:18px 32px;background:${C.soft};border-bottom:1px solid ${C.hairlineCool};">
      <p style="margin:0 0 12px;font-size:10px;font-weight:600;color:${C.muted};letter-spacing:0.08em;text-transform:uppercase;">Last 7 Days</p>
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:28px;">
            <p style="margin:0 0 2px;font-size:11px;color:${C.muted};">Points gained</p>
            <p style="margin:0;font-size:20px;font-weight:700;font-family:monospace;color:${score_7d >= 0 ? C.primaryDeep : "#dc2626"};">
              ${score_7d >= 0 ? "+" : ""}${score_7d}
            </p>
          </td>
          <td style="padding-right:28px;">
            <p style="margin:0 0 2px;font-size:11px;color:${C.muted};">Rank change</p>
            <p style="margin:0;font-size:20px;font-weight:700;font-family:monospace;color:${rank_7d <= 0 ? C.primaryDeep : "#dc2626"};">
              ${rank_7d <= 0 ? `↑ ${Math.abs(rank_7d)}` : `↓ ${rank_7d}`}
            </p>
          </td>
          <td>
            <p style="margin:0 0 2px;font-size:11px;color:${C.muted};">Snapshots</p>
            <p style="margin:0;font-size:20px;font-weight:700;font-family:monospace;color:${C.ink};">${history_count}</p>
          </td>
        </tr>
      </table>
    </div>

    ${roleScoreTable(p.role_scores)}
    ${trackPills(p.tracks ?? [])}
    ${breakdownSection(p.breakdown ?? [])}
    ${emailFooter(p.github_id, p.timestamp)}
  `;

  return wrap(body);
}
