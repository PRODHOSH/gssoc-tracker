import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, GitPullRequest, Clock, AlertTriangle, Star, RefreshCw } from "lucide-react";
import { ds, fontMono } from "@/lib/ds";
import { buildPRTrackerData } from "@/lib/pr-tracker";
import { GitHubProfileCard } from "@/components/pr-tracker/GitHubProfileCard";
import { StatsGrid } from "@/components/pr-tracker/StatsGrid";
import { PRTable } from "@/components/pr-tracker/PRTable";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { ScoringGuide } from "@/components/pr-tracker/ScoringGuide";
import type { PRTrackerData } from "@/types/pr-tracker";
import type { Metadata } from "next";
import { NpsFeedback } from "@/components/NpsFeedback";
import { StarNudge } from "@/components/StarNudge";
import { GSSOC_REPO_SET } from "@/data/gssoc-repos";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const decoded = decodeURIComponent(username);
  try {
    const data = await buildPRTrackerData(decoded);
    const display = data.user.name ?? data.user.login;
    const title = `@${data.user.login} — ${data.totalPoints} pts · GSSoC 2026`;
    const description = `${display} has earned ${data.totalPoints} GSSoC 2026 points from ${data.validPRs.length} merged PRs across ${data.uniqueRepos} repos. Rank: ${data.rank}.`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://gssoc-tracker.vercel.app/pr-tracker/${data.user.login}`,
        images: [{ url: data.user.avatar_url, width: 400, height: 400, alt: `${data.user.login} avatar` }],
      },
      twitter: { card: "summary", title, description, images: [data.user.avatar_url] },
      alternates: { canonical: `https://gssoc-tracker.vercel.app/pr-tracker/${data.user.login}` },
    };
  } catch {
    return { title: "Contributor Stats | GSSoC PR Tracker" };
  }
}

interface Props {
  params: Promise<{ username: string }>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      margin: "0 0 8px",
      fontSize: 11, fontWeight: 700,
      color: ds.inkMute2,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    }}>
      {children}
    </p>
  );
}

export default async function PRTrackerDashboard({ params }: Props) {
  const { username } = await params;
  const decoded = decodeURIComponent(username);

  let data: PRTrackerData | null = null;
  let errorCode: string | null = null;

  try {
    data = await buildPRTrackerData(decoded);
  } catch (err: unknown) {
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

  const isProjectAdmin = Array.from(GSSOC_REPO_SET).some(
    (repoKey) => repoKey.split("/")[0] === data.user.login.toLowerCase()
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "var(--font-sans)" }}>
      <NpsFeedback />
      <StarNudge username={decoded} />
      {/* ── Sticky nav ── */}
      <div style={{
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${ds.hairlineCool}`,
        padding: "0 24px",
        height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 20,
        boxShadow: "0 1px 4px rgba(23,23,23,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            color: ds.inkMute, textDecoration: "none", fontSize: 13,
            padding: "4px 8px", borderRadius: ds.rSm,
            transition: "background 0.12s",
          }}>
            <ArrowLeft size={13} /> Search
          </Link>

          <div style={{ width: 1, height: 16, background: ds.hairline }} />

          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: "rgba(62,207,142,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <GitPullRequest size={12} color={ds.primaryDeep} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: ds.ink, letterSpacing: "-0.01em" }}>
              GSSoC PR Tracker
            </span>
            <span style={{
              fontSize: 12, color: ds.inkMute2, fontFamily: fontMono,
              background: ds.canvasSoft,
              padding: "1px 7px", borderRadius: ds.rFull,
              border: `1px solid ${ds.hairlineCool}`,
            }}>
              @{data.user.login}
            </span>
            <ScoringGuide />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: ds.inkFaint }}>
            <Clock size={10} /> {fetchedDate}
          </span>

          <a
            href={`/pr-tracker/${encodeURIComponent(decoded)}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "5px 11px", borderRadius: ds.rSm,
              border: `1px solid ${ds.hairlineCool}`,
              fontSize: 12, fontWeight: 500, color: ds.inkMute,
              textDecoration: "none", background: ds.canvas,
            }}
          >
            <RefreshCw size={11} /> Refresh
          </a>

          <a
            href="https://github.com/PRODHOSH/gssoc-tracker"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "5px 12px", borderRadius: ds.rSm,
              border: "1px solid rgba(202,138,4,0.3)",
              fontSize: 12, fontWeight: 600, color: "#92400e",
              textDecoration: "none",
              background: "rgba(251,191,36,0.07)",
            }}
          >
            <Star size={11} /> Star
          </a>
        </div>
      </div>

      {/* ── Page body ── */}
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 20px 64px" }}>

        {/* Profile */}
        <GitHubProfileCard user={data.user} rank={data.rank} totalPoints={data.totalPoints} />

        {/* Dual-role notice */}
        {isProjectAdmin && (
          <div style={{
            background: "linear-gradient(90deg, rgba(129,140,248,0.04) 0%, rgba(62,207,142,0.04) 100%)",
            border: `1px solid ${ds.hairlineCool}`,
            borderRadius: ds.rLg,
            padding: "14px 20px",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12
          }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: ds.ink }}>Also a Project Admin?</span>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: ds.inkMute }}>
                Track your GSSoC 2026 points from merging, labeling and managing issues on your project admin dashboard.
              </p>
            </div>
            <Link 
              href={`/project-admin/${encodeURIComponent(data.user.login)}`}
              style={{
                padding: "6px 14px",
                borderRadius: ds.rSm,
                border: "1.5px solid #818cf8",
                background: "transparent",
                color: "#4f46e5",
                fontSize: 12,
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.15s"
              }}
            >
              Project Admin Dashboard →
            </Link>
          </div>
        )}

        {/* Stats */}
        <StatsGrid data={data} />

        {/* Empty state */}
        {data.allPRs.length === 0 && (
          <div style={{
            background: "rgba(245,158,11,0.05)",
            border: `1px solid rgba(245,158,11,0.25)`,
            borderRadius: ds.rLg,
            padding: "16px 20px",
            marginBottom: 16,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <AlertTriangle size={16} color="#f59e0b" />
            <p style={{ margin: 0, fontSize: 13, color: ds.inkMute }}>
              No GSSoC PRs found for <strong>@{data.user.login}</strong>.
              Make sure your PRs have the{" "}
              <code style={{ fontFamily: fontMono, fontSize: 11, background: ds.canvasSoft, padding: "1px 5px", borderRadius: 4 }}>gssoc:approved</code>{" "}
              label.
            </p>
          </div>
        )}

        {/* Charts */}
        {data.validPRs.length > 0 && (
          <>
            <SectionLabel>Analytics</SectionLabel>
            <div style={{ marginBottom: 20 }}>
              <AnalyticsCharts prs={data.validPRs.map((pr) => ({
                levelKey: pr.difficulty,
                qualityKey: pr.quality,
                typeKeys: pr.typeBonuses,
              }))} />
            </div>
          </>
        )}

        {/* PR Table */}
        <SectionLabel>Pull Requests</SectionLabel>
        <div style={{ marginBottom: 16 }}>
          <PRTable prs={data.allPRs} username={data.user.login} />
        </div>

        {/* Formula note */}
        <div style={{
          background: ds.canvas,
          border: `1px solid ${ds.hairlineCool}`,
          borderLeft: `3px solid rgba(62,207,142,0.4)`,
          borderRadius: ds.rMd,
          padding: "12px 16px",
          marginBottom: 32,
        }}>
          <p style={{ margin: 0, fontSize: 12, color: ds.inkMute2, lineHeight: 1.7 }}>
            <strong style={{ color: ds.inkMute, fontSize: 12 }}>Scoring formula</strong>
            {"  "}
            <code style={{ fontFamily: fontMono, fontSize: 11, background: "#f0fdf4", color: "#166534", padding: "1px 6px", borderRadius: 4 }}>
              50 + (difficulty × quality) + type_bonus
            </code>
            {"  ·  "}
            PRs tagged{" "}
            {["gssoc:invalid", "gssoc:spam", "gssoc:ai-slop"].map((l) => (
              <code key={l} style={{ fontFamily: fontMono, fontSize: 11, background: "#fef2f2", color: "#991b1b", padding: "1px 5px", borderRadius: 4, marginRight: 4 }}>
                {l}
              </code>
            ))}
            earn 0 pts.
          </p>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: ds.inkFaint, lineHeight: 1.7 }}>
          Not affiliated with GirlScript Summer of Code or GirlScript Foundation ·{" "}
          <a href="/terms" style={{ color: ds.inkMute2, textDecoration: "underline" }}>Terms &amp; Privacy</a>
        </p>
      </div>
    </div>
  );
}

/* ── Error page ── */
function ErrorPage({ username, code }: { username: string; code: string }) {
  const isRateLimit = code === "RATE_LIMITED";
  return (
    <div style={{
      minHeight: "100vh", background: "#f5f5f5",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-sans)", padding: 24,
    }}>
      <div style={{
        background: ds.canvas, border: `1px solid ${ds.hairlineCool}`,
        borderRadius: ds.rXl, padding: "44px 52px", textAlign: "center", maxWidth: 460,
        boxShadow: "0 4px 24px rgba(23,23,23,0.08)",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: isRateLimit ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <AlertTriangle size={22} color={isRateLimit ? "#f59e0b" : "#ef4444"} />
        </div>
        <h1 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 700, color: ds.ink }}>
          {isRateLimit ? "Rate limit reached" : "Something went wrong"}
        </h1>
        <p style={{ margin: "0 0 28px", fontSize: 14, color: ds.inkMute, lineHeight: 1.65 }}>
          {isRateLimit
            ? "GitHub API rate limit exceeded. Add a GH_TOKEN env var to get 5,000 req/hr, or wait a few minutes."
            : `Failed to fetch PR data for @${username}. The GitHub API may be temporarily unavailable.`}
        </p>
        <a href="" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "9px 20px", borderRadius: ds.rSm,
          background: ds.primary, color: ds.onPrimary,
          textDecoration: "none", fontSize: 14, fontWeight: 600,
          letterSpacing: "-0.01em",
        }}>
          <RefreshCw size={14} /> Try again
        </a>
      </div>
    </div>
  );
}
