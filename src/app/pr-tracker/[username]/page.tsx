import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { buildPRTrackerData } from "@/lib/pr-tracker";
import { GitHubProfileCard } from "@/components/pr-tracker/GitHubProfileCard";
import { StatsGrid } from "@/components/pr-tracker/StatsGrid";
import { PRTable } from "@/components/pr-tracker/PRTable";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { ScoringGuide } from "@/components/pr-tracker/ScoringGuide";
import { TrackerNavbar } from "@/components/pr-tracker/TrackerNavbar";
import { ScrollSlideIn } from "@/components/animations/ScrollSlideIn";
import { ContributionHeatmap } from "@/components/pr-tracker/ContributionHeatmap";
import { HomeFooter } from "@/components/home/HomeFooter";
import { QuickFeedbackPopup } from "@/components/QuickFeedbackPopup";
import type { PRTrackerData } from "@/types/pr-tracker";
import type { Metadata } from "next";

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

  return (
    <div className="bg-background text-ghost-white min-h-screen font-sans flex flex-col overflow-x-hidden">
      <TrackerNavbar username={decoded} />

      <main className="pt-24 pb-16 max-w-[1200px] mx-auto px-8 w-full flex-1">
        {/* Profile */}
        <GitHubProfileCard user={data.user} rank={data.rank} totalPoints={data.totalPoints} />

        {/* Stats */}
        <StatsGrid data={data} />

        {/* Empty state */}
        {data.allPRs.length === 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mb-8 flex items-center gap-4">
            <AlertTriangle className="text-yellow-500 w-6 h-6 shrink-0" />
            <p className="text-sm text-muted-steel m-0">
              No GSSoC PRs found for <strong className="text-ghost-white">@{data.user.login}</strong>.
              Make sure your PRs have the{" "}
              <code className="font-mono text-xs bg-canvas-night/50 px-1.5 py-0.5 rounded border border-whisper-border text-ghost-white">gssoc:approved</code>{" "}
              label.
            </p>
          </div>
        )}

        {/* Charts */}
        {data.validPRs.length > 0 && (
          <>
            <ScrollSlideIn direction="left">
              <ContributionHeatmap prs={data.validPRs} streak={data.streak} />
            </ScrollSlideIn>
            <AnalyticsCharts prs={data.validPRs} />
          </>
        )}

        {/* PR Table */}
        <ScrollSlideIn direction="left">
          <PRTable prs={data.allPRs} username={data.user.login} />
        </ScrollSlideIn>

        {/* Scoring Guide */}
        <ScrollSlideIn direction="right">
          <ScoringGuide />
        </ScrollSlideIn>
      </main>

      <HomeFooter />
      <QuickFeedbackPopup />
    </div>
  );
}

/* ── Error page ── */
function ErrorPage({ username, code }: { username: string; code: string }) {
  const isRateLimit = code === "RATE_LIMITED";
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-pure-surface border border-whisper-border rounded-xl p-10 text-center max-w-md shadow-2xl">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6 ${isRateLimit ? 'bg-yellow-500/10' : 'bg-red-500/10'}`}>
          <AlertTriangle className={`w-6 h-6 ${isRateLimit ? 'text-yellow-500' : 'text-red-500'}`} />
        </div>
        <h1 className="text-xl font-bold text-ghost-white mb-3">
          {isRateLimit ? "Rate limit reached" : "Something went wrong"}
        </h1>
        <p className="text-sm text-muted-steel leading-relaxed mb-8">
          {isRateLimit
            ? "GitHub API rate limit exceeded. Add a GH_TOKEN env var to get 5,000 req/hr, or wait a few minutes."
            : `Failed to fetch PR data for @${username}. The GitHub API may be temporarily unavailable.`}
        </p>
        <Link href="/" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-mono text-[11px] font-bold uppercase tracking-widest hover:bg-primary-deep transition-all">
          Try again
        </Link>
      </div>
    </div>
  );
}
