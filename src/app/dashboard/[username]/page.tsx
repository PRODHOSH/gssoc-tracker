import { notFound } from "next/navigation";
import { findParticipant } from "@/lib/gssoc";
import { getHistory, getNotifications, getProfile } from "@/lib/data";
import { Header } from "@/components/dashboard/Header";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { PointsChart } from "@/components/dashboard/PointsChart";
import { RankChart } from "@/components/dashboard/RankChart";
import { BreakdownChart } from "@/components/dashboard/BreakdownChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { ManualSync } from "@/components/dashboard/ManualSync";
import { ProfileSnapshot, HistoryEntry, NotificationLog } from "@/types";
import { ds, fontMono } from "@/lib/ds";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

const TRACKED_USER = "PRODHOSH"; // only this user has history

interface Props {
  params: Promise<{ username: string }>;
}

export default async function DashboardPage({ params }: Props) {
  const { username } = await params;
  const decoded = decodeURIComponent(username);

  // Fetch from GSSoC (shared in-memory cache)
  let profile: ProfileSnapshot | null = null;
  try {
    profile = await findParticipant(decoded);
  } catch {
    // API unreachable — fall through to show error
  }

  if (!profile) {
    return <NotFoundPage username={decoded} />;
  }

  // History + notifications: only available for the tracked user
  const isTracked  = decoded.toLowerCase() === TRACKED_USER.toLowerCase();
  const history: HistoryEntry[]       = isTracked ? getHistory()       : [];
  const notifications: NotificationLog[] = isTracked ? getNotifications() : [];

  // Rank/score change from last history entry
  let rankChange = 0;
  let scoreChange = 0;
  if (history.length >= 2) {
    const prev = history[history.length - 2];
    const curr = history[history.length - 1];
    rankChange  = curr.rank  - prev.rank;
    scoreChange = curr.score - prev.score;
  }

  return (
    <div style={{ minHeight: "100vh", background: ds.canvasSoft, fontFamily: "var(--font-sans)" }}>
      {/* Nav */}
      <div style={{
        background: ds.canvas,
        borderBottom: `1px solid ${ds.hairlineCool}`,
        padding: "0 20px",
        height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 10,
        boxShadow: "0 1px 3px rgba(23,23,23,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: 4,
            color: ds.inkMute, textDecoration: "none", fontSize: 13,
          }}>
            <ArrowLeft size={14} />
            Search
          </Link>
          <span style={{ color: ds.hairline }}>|</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: ds.primary, display: "inline-block" }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: ds.ink }}>GSSoC Tracker</span>
            <span style={{ fontSize: 12, color: ds.inkMute2 }}>@{profile.github_id}</span>
          </div>
        </div>
        {isTracked && <ManualSync compact />}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px 48px" }}>
        {/* Tracked vs live-only banner */}
        {!isTracked && (
          <div style={{
            background: "rgba(62,207,142,0.06)",
            border: `1px solid rgba(62,207,142,0.2)`,
            borderRadius: ds.rMd,
            padding: "10px 16px",
            marginBottom: 16,
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
          }}>
            <p style={{ margin: 0, fontSize: 13, color: ds.inkMute }}>
              <span style={{ color: ds.primaryDeep, fontWeight: 600 }}>Live snapshot</span>
              {" "}— history tracking is only available for the owner&apos;s account.
            </p>
          </div>
        )}

        <Header
          profile={profile}
          rankChange={rankChange}
          scoreChange={scoreChange}
          lastSynced={profile.timestamp}
        />

        <StatsGrid profile={profile} history={history} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 12, marginBottom: 12 }}>
          <PointsChart history={history} currentScore={profile.score} />
          <BreakdownChart profile={profile} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <RankChart history={history} currentRank={profile.rank} />
        </div>

        {isTracked && (
          <ActivityFeed history={history} notifications={notifications} />
        )}

        {/* Score breakdown detail */}
        {profile.breakdown.length > 0 && (
          <div style={{
            marginTop: 12,
            background: ds.canvas,
            border: `1px solid ${ds.hairlineCool}`,
            borderRadius: ds.rLg,
            padding: 20,
            boxShadow: "0 1px 3px rgba(23,23,23,0.04)",
          }}>
            <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 600, color: ds.ink }}>Score Breakdown Detail</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 4 }}>
              {profile.breakdown.map((b, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "7px 10px", borderRadius: ds.rSm,
                  background: i % 2 === 0 ? ds.canvas : ds.canvasSoft,
                  border: `1px solid ${ds.hairlineCool}`,
                }}>
                  <span style={{ fontSize: 12, color: ds.inkMute }}>{b.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: fontMono, color: b.pts > 0 ? ds.primaryDeep : ds.inkFaint }}>
                    {b.pts > 0 ? `+${b.pts}` : b.pts}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: 12, color: ds.inkFaint, marginTop: 32 }}>
          GSSoC 2026 Progress Tracker ·{" "}
          <a href="https://gssoc.girlscript.org" target="_blank" rel="noopener noreferrer" style={{ color: ds.inkMute2 }}>
            gssoc.girlscript.org
          </a>
        </p>
      </div>
    </div>
  );
}

function NotFoundPage({ username }: { username: string }) {
  return (
    <div style={{
      minHeight: "100vh", background: ds.canvasSoft,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-sans)",
    }}>
      <div style={{
        background: ds.canvas, border: `1px solid ${ds.hairlineCool}`,
        borderRadius: ds.rLg, padding: "40px 48px", textAlign: "center", maxWidth: 440,
        boxShadow: "0 1px 3px rgba(23,23,23,0.06)",
      }}>
        <p style={{ margin: "0 0 4px", fontSize: 11, color: ds.inkMute2, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
          GSSoC Tracker
        </p>
        <h1 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 600, color: ds.ink }}>
          @{username} not found
        </h1>
        <p style={{ margin: "0 0 24px", fontSize: 14, color: ds.inkMute, lineHeight: 1.6 }}>
          This GitHub ID isn&apos;t in the GSSoC 2026 leaderboard, or the API is temporarily unavailable.
        </p>
        <Link href="/" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 16px", borderRadius: ds.rSm,
          background: ds.primary, color: ds.onPrimary,
          textDecoration: "none", fontSize: 14, fontWeight: 500,
        }}>
          <ArrowLeft size={14} /> Try another username
        </Link>
      </div>
    </div>
  );
}
