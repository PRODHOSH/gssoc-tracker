import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Clock, AlertTriangle, Star, RefreshCw } from "lucide-react";
import { ds, fontMono } from "@/lib/ds";
import { buildMentorTrackerData } from "@/lib/mentor-tracker";
import { GitHubProfileCard } from "@/components/pr-tracker/GitHubProfileCard";
import { MentorStatsGrid } from "@/components/mentor/MentorStatsGrid";
import { MentorPRTable } from "@/components/mentor/MentorPRTable";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { MentorScoringGuide } from "@/components/mentor/MentorScoringGuide";
import type { MentorTrackerData } from "@/lib/mentor-tracker";
import type { Metadata } from "next";
import { NpsFeedback } from "@/components/NpsFeedback";
import { StarNudge } from "@/components/StarNudge";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const decoded = decodeURIComponent(username);
  try {
    const data = await buildMentorTrackerData(decoded);
    const display = data.user.name ?? data.user.login;
    const title = `@${data.user.login} — GSSoC 2026 Mentor · ${data.totalPoints} pts`;
    const description = `${display} has reviewed ${data.totalPRs} PRs as a GSSoC 2026 mentor, earning ${data.totalPoints} mentor points.`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://gssoc-tracker.vercel.app/mentor/${data.user.login}`,
        images: [{ url: data.user.avatar_url, width: 400, height: 400, alt: `${data.user.login} avatar` }],
      },
      twitter: { card: "summary", title, description, images: [data.user.avatar_url] },
      alternates: { canonical: `https://gssoc-tracker.vercel.app/mentor/${data.user.login}` },
    };
  } catch {
    return { title: "Mentor Stats | GSSoC PR Tracker" };
  }
}

interface Props {
  params: Promise<{ username: string }>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: ds.inkMute2, letterSpacing: "0.08em", textTransform: "uppercase" }}>
      {children}
    </p>
  );
}

export default async function MentorTrackerPage({ params }: Props) {
  const { username } = await params;
  const decoded = decodeURIComponent(username);

  let data: MentorTrackerData | null = null;
  let errorCode: string | null = null;

  try {
    data = await buildMentorTrackerData(decoded);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "USER_NOT_FOUND") return notFound();
    errorCode = msg.startsWith("RATE_LIMITED") ? "RATE_LIMITED" : "API_ERROR";
  }

  if (errorCode) return <ErrorPage username={decoded} code={errorCode} />;
  if (!data) return notFound();

  const fetchedDate = new Date(data.fetchedAt).toLocaleString("en-IN", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  const mentorBadge = {
    label: "GSSoC Mentor",
    emoji: "🧑‍🏫",
    pill: "#fffbeb", pillText: "#92400e", pillBorder: "#fde68a",
    glow: "rgba(251,191,36,0.1)",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "var(--font-sans)" }}>
      <NpsFeedback />
      <StarNudge username={decoded} />
      {/* ── Sticky nav ── */}
      <div style={{
        background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${ds.hairlineCool}`,
        padding: "0 24px", height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 20,
        boxShadow: "0 1px 4px rgba(23,23,23,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 5, color: ds.inkMute, textDecoration: "none", fontSize: 13, padding: "4px 8px", borderRadius: ds.rSm, transition: "background 0.12s" }}>
            <ArrowLeft size={13} /> Search
          </Link>
          <div style={{ width: 1, height: 16, background: ds.hairline }} />
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(251,191,36,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={12} color="#ca8a04" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: ds.ink, letterSpacing: "-0.01em" }}>
              GSSoC Mentor Tracker
            </span>
            <span style={{ fontSize: 12, color: ds.inkMute2, fontFamily: fontMono, background: ds.canvasSoft, padding: "1px 7px", borderRadius: ds.rFull, border: `1px solid ${ds.hairlineCool}` }}>
              @{data.user.login}
            </span>
            <MentorScoringGuide />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: ds.inkFaint }}>
            <Clock size={10} /> {fetchedDate}
          </span>
          <a href={`/mentor/${encodeURIComponent(decoded)}`} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: ds.rSm, border: `1px solid ${ds.hairlineCool}`, fontSize: 12, fontWeight: 500, color: ds.inkMute, textDecoration: "none", background: ds.canvas }}>
            <RefreshCw size={11} /> Refresh
          </a>
          <a href="https://github.com/PRODHOSH/gssoc-tracker" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: ds.rSm, border: "1px solid rgba(202,138,4,0.3)", fontSize: 12, fontWeight: 600, color: "#92400e", textDecoration: "none", background: "rgba(251,191,36,0.07)" }}>
            <Star size={11} /> Star
          </a>
        </div>
      </div>

      {/* ── Page body ── */}
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 20px 64px" }}>

        {/* Profile */}
        <GitHubProfileCard
          user={data.user}
          rank="Beginner Contributor"
          badgeOverride={mentorBadge}
          totalPoints={data.totalPoints}
          pointsLabel="Mentor Points"
          pointsColor="#92400e"
        />

        {/* Stats */}
        <MentorStatsGrid data={data} />

        {/* Empty state */}
        {data.prs.length === 0 && (
          <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: ds.rLg, padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <AlertTriangle size={16} color="#f59e0b" />
            <p style={{ margin: 0, fontSize: 13, color: ds.inkMute }}>
              No mentored PRs found for <strong>@{data.user.login}</strong>. PRs must have both{" "}
              <code style={{ fontFamily: fontMono, fontSize: 11, background: "#fffbeb", padding: "1px 5px", borderRadius: 4, color: "#92400e" }}>mentor:{data.user.login}</code>{" "}
              and{" "}
              <code style={{ fontFamily: fontMono, fontSize: 11, background: ds.canvasSoft, padding: "1px 5px", borderRadius: 4 }}>gssoc:approved</code>{" "}
              labels.
            </p>
          </div>
        )}

        {/* Charts */}
        {data.prs.length > 0 && (
          <>
            <SectionLabel>Analytics</SectionLabel>
            <div style={{ marginBottom: 20 }}>
              <AnalyticsCharts prs={data.prs.map((pr) => ({
                levelKey: pr.levelLabel,
                qualityKey: pr.qualityLabel,
                typeKeys: pr.labels.filter((l) => l.startsWith("type:")),
              }))} />
            </div>
          </>
        )}

        {/* PR Table */}
        <SectionLabel>Reviewed Pull Requests</SectionLabel>
        <div style={{ marginBottom: 16 }}>
          <MentorPRTable prs={data.prs} />
        </div>

        {/* Formula note */}
        <div style={{ background: ds.canvas, border: `1px solid ${ds.hairlineCool}`, borderLeft: `3px solid rgba(251,191,36,0.5)`, borderRadius: ds.rMd, padding: "12px 16px", marginBottom: 32 }}>
          <p style={{ margin: 0, fontSize: 12, color: ds.inkMute2, lineHeight: 1.7 }}>
            <strong style={{ color: ds.inkMute, fontSize: 12 }}>Mentor scoring</strong>
            {"  "}
            <code style={{ fontFamily: fontMono, fontSize: 11, background: "#fffbeb", color: "#92400e", padding: "1px 6px", borderRadius: 4 }}>
              level_base + quality_bonus
            </code>
            {"  ·  Searches PRs labeled  "}
            <code style={{ fontFamily: fontMono, fontSize: 11, background: ds.canvasSoft, padding: "1px 5px", borderRadius: 4 }}>
              mentor:{data.user.login}
            </code>
            {" + "}
            <code style={{ fontFamily: fontMono, fontSize: 11, background: ds.canvasSoft, padding: "1px 5px", borderRadius: 4 }}>
              gssoc:approved
            </code>
          </p>
        </div>

        {/* Also track as contributor */}
        <div style={{ background: "rgba(62,207,142,0.04)", border: "1px solid rgba(62,207,142,0.2)", borderRadius: ds.rLg, padding: "14px 18px", marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ margin: 0, fontSize: 13, color: ds.inkMute }}>
            Also tracking contributor PRs?
          </p>
          <Link href={`/pr-tracker/${encodeURIComponent(decoded)}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: ds.rSm, background: ds.primary, color: ds.onPrimary, textDecoration: "none", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
            View contributor stats →
          </Link>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: ds.inkFaint, lineHeight: 1.7 }}>
          Not affiliated with GirlScript Summer of Code or GirlScript Foundation ·{" "}
          <a href="/terms" style={{ color: ds.inkMute2, textDecoration: "underline" }}>Terms &amp; Privacy</a>
        </p>
      </div>
    </div>
  );
}

function ErrorPage({ username, code }: { username: string; code: string }) {
  const isRateLimit = code === "RATE_LIMITED";
  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-sans)", padding: 24 }}>
      <div style={{ background: ds.canvas, border: `1px solid ${ds.hairlineCool}`, borderRadius: ds.rXl, padding: "44px 52px", textAlign: "center", maxWidth: 460, boxShadow: "0 4px 24px rgba(23,23,23,0.08)" }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: isRateLimit ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <AlertTriangle size={22} color={isRateLimit ? "#f59e0b" : "#ef4444"} />
        </div>
        <h1 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 700, color: ds.ink }}>
          {isRateLimit ? "Rate limit reached" : "Something went wrong"}
        </h1>
        <p style={{ margin: "0 0 28px", fontSize: 14, color: ds.inkMute, lineHeight: 1.65 }}>
          {isRateLimit ? "GitHub API rate limit exceeded. Try again in a few minutes." : `Failed to fetch mentor data for @${username}.`}
        </p>
        <a href="" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: ds.rSm, background: ds.primary, color: ds.onPrimary, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
          <RefreshCw size={14} /> Try again
        </a>
      </div>
    </div>
  );
}
