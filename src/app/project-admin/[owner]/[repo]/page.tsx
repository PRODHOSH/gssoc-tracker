import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, FolderGit2, Clock, AlertTriangle, Star, RefreshCw, GitFork, ExternalLink } from "lucide-react";
import { ds, fontMono } from "@/lib/ds";
import { buildProjectAdminData } from "@/lib/project-admin-tracker";
import { ProjectStatsGrid } from "@/components/project-admin/ProjectStatsGrid";
import { ProjectPRTable } from "@/components/project-admin/ProjectPRTable";
import { ScoringGuide } from "@/components/pr-tracker/ScoringGuide";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ owner: string; repo: string }>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: ds.inkMute2, letterSpacing: "0.08em", textTransform: "uppercase" }}>
      {children}
    </p>
  );
}

export default async function ProjectAdminPage({ params }: Props) {
  const { owner, repo } = await params;

  let data = null as Awaited<ReturnType<typeof buildProjectAdminData>> | null;
  let errorCode: string | null = null;

  try {
    data = await buildProjectAdminData(owner, repo);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "REPO_NOT_FOUND") return notFound();
    errorCode = msg.startsWith("RATE_LIMITED") ? "RATE_LIMITED" : "API_ERROR";
  }

  if (errorCode) return <ErrorPage owner={owner} repo={repo} code={errorCode} />;
  if (!data) return notFound();

  const fetchedDate = new Date(data.fetchedAt).toLocaleString("en-IN", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "var(--font-sans)" }}>
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
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 5, color: ds.inkMute, textDecoration: "none", fontSize: 13, padding: "4px 8px", borderRadius: ds.rSm }}>
            <ArrowLeft size={13} /> Search
          </Link>
          <div style={{ width: 1, height: 16, background: ds.hairline }} />
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(129,140,248,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FolderGit2 size={12} color="#818cf8" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: ds.ink, letterSpacing: "-0.01em" }}>
              Project Admin Tracker
            </span>
            <span style={{ fontSize: 12, color: ds.inkMute2, fontFamily: fontMono, background: ds.canvasSoft, padding: "1px 7px", borderRadius: ds.rFull, border: `1px solid ${ds.hairlineCool}` }}>
              {owner}/{repo}
            </span>
            <ScoringGuide />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: ds.inkFaint }}>
            <Clock size={10} /> {fetchedDate}
          </span>
          <a href={`/project-admin/${owner}/${repo}`} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: ds.rSm, border: `1px solid ${ds.hairlineCool}`, fontSize: 12, fontWeight: 500, color: ds.inkMute, textDecoration: "none", background: ds.canvas }}>
            <RefreshCw size={11} /> Refresh
          </a>
          <a href="https://github.com/PRODHOSH/gssoc-tracker" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: ds.rSm, border: "1px solid rgba(202,138,4,0.3)", fontSize: 12, fontWeight: 600, color: "#92400e", textDecoration: "none", background: "rgba(251,191,36,0.07)" }}>
            <Star size={11} /> Star
          </a>
        </div>
      </div>

      {/* ── Page body ── */}
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 20px 64px" }}>

        {/* Repo card */}
        <div style={{ background: ds.canvas, border: `1px solid ${ds.hairlineCool}`, borderRadius: ds.rXl, overflow: "hidden", boxShadow: "0 2px 12px rgba(23,23,23,0.07)", marginBottom: 16 }}>
          {/* Banner */}
          <div style={{ height: 72, background: "linear-gradient(135deg, #0d1117 0%, #161b22 40%, #1c2128 100%)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(129,140,248,0.15) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div style={{ position: "absolute", right: -40, top: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(129,140,248,0.12)", filter: "blur(40px)" }} />
          </div>

          {/* Content */}
          <div style={{ padding: "0 24px 20px", position: "relative" }}>
            <div style={{ marginTop: -28, marginBottom: 14 }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <div style={{ width: 72, height: 72, borderRadius: ds.rLg, border: `3px solid ${ds.canvas}`, background: ds.canvas, boxShadow: "0 2px 8px rgba(23,23,23,0.14)", overflow: "hidden" }}>
                  <Image src={data.repo.owner.avatar_url} alt={owner} width={72} height={72} unoptimized style={{ display: "block" }} />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: ds.ink, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                    {data.repo.name}
                  </span>
                  <a href={data.repo.html_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: ds.inkMute2, textDecoration: "none" }}>
                    <ExternalLink size={11} /> {data.repo.full_name}
                  </a>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: ds.rFull, fontSize: 11, fontWeight: 700, letterSpacing: "0.01em", background: "rgba(129,140,248,0.1)", color: "#4f46e5", border: "1px solid rgba(129,140,248,0.3)" }}>
                  ⚙️ Project Admin View
                </span>
              </div>

              {/* Points box */}
              <div style={{ padding: "10px 18px", background: "rgba(62,207,142,0.06)", border: "1.5px solid rgba(62,207,142,0.2)", borderRadius: ds.rLg, textAlign: "center", minWidth: 120, flexShrink: 0 }}>
                <p style={{ margin: "0 0 1px", fontSize: 10, fontWeight: 700, color: ds.inkMute2, letterSpacing: "0.1em", textTransform: "uppercase" }}>Total Points</p>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: ds.primaryDeep, fontFamily: fontMono, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                  {data.totalPoints.toLocaleString()}
                </p>
                <p style={{ margin: "3px 0 0", fontSize: 10, color: ds.inkMute2 }}>awarded to contributors</p>
              </div>
            </div>

            {data.repo.description && (
              <p style={{ margin: "0 0 12px", fontSize: 13, color: ds.inkMute, lineHeight: 1.6, maxWidth: 540 }}>
                {data.repo.description}
              </p>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: ds.inkMute2 }}>
                <Star size={11} /> <strong style={{ color: ds.inkMute }}>{data.repo.stargazers_count.toLocaleString()}</strong> stars
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: ds.inkMute2 }}>
                <GitFork size={11} /> <strong style={{ color: ds.inkMute }}>{data.repo.forks_count.toLocaleString()}</strong> forks
              </span>
              {data.repo.language && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: ds.inkMute2 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: ds.primaryDeep, display: "inline-block" }} />
                  {data.repo.language}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <ProjectStatsGrid data={data} />

        {/* Empty state */}
        {data.allPRs.length === 0 && (
          <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: ds.rLg, padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <AlertTriangle size={16} color="#f59e0b" />
            <p style={{ margin: 0, fontSize: 13, color: ds.inkMute }}>
              No approved PRs found in <strong>{owner}/{repo}</strong>. PRs must have the{" "}
              <code style={{ fontFamily: fontMono, fontSize: 11, background: ds.canvasSoft, padding: "1px 5px", borderRadius: 4 }}>gssoc:approved</code> label.
            </p>
          </div>
        )}

        {/* PR Table */}
        <SectionLabel>Pull Requests</SectionLabel>
        <div style={{ marginBottom: 16 }}>
          <ProjectPRTable prs={data.allPRs} />
        </div>

        {/* Formula note */}
        <div style={{ background: ds.canvas, border: `1px solid ${ds.hairlineCool}`, borderLeft: `3px solid rgba(62,207,142,0.4)`, borderRadius: ds.rMd, padding: "12px 16px", marginBottom: 32 }}>
          <p style={{ margin: 0, fontSize: 12, color: ds.inkMute2, lineHeight: 1.7 }}>
            <strong style={{ color: ds.inkMute, fontSize: 12 }}>Scoring formula</strong>
            {"  "}
            <code style={{ fontFamily: fontMono, fontSize: 11, background: "#f0fdf4", color: "#166534", padding: "1px 6px", borderRadius: 4 }}>
              50 + (difficulty × quality) + type_bonus
            </code>
            {"  ·  "}
            PRs tagged{" "}
            {["gssoc:invalid", "gssoc:spam", "gssoc:ai-slop"].map((l) => (
              <code key={l} style={{ fontFamily: fontMono, fontSize: 11, background: "#fef2f2", color: "#991b1b", padding: "1px 5px", borderRadius: 4, marginRight: 4 }}>{l}</code>
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

function ErrorPage({ owner, repo, code }: { owner: string; repo: string; code: string }) {
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
          {isRateLimit
            ? "GitHub API rate limit exceeded. Try again in a few minutes."
            : `Failed to fetch data for ${owner}/${repo}.`}
        </p>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: ds.rSm, background: ds.primary, color: ds.onPrimary, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
          <ArrowLeft size={14} /> Try again
        </Link>
      </div>
    </div>
  );
}
