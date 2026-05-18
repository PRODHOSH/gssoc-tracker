import { GitMerge, CheckCircle, Building2, Flame, Trophy } from "lucide-react";
import { ds, fontMono } from "@/lib/ds";
import type { PRTrackerData } from "@/types/pr-tracker";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
  accentBg: string;
}

function StatCard({ icon, label, value, sub, accent, accentBg }: StatCardProps) {
  return (
    <div style={{
      background: ds.canvas,
      border: `1px solid ${ds.hairlineCool}`,
      borderRadius: ds.rLg,
      padding: "16px 18px",
      boxShadow: "0 1px 4px rgba(23,23,23,0.04)",
      borderLeft: `3px solid ${accent}`,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Subtle bg tint */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 80, height: 80,
        background: accentBg,
        borderRadius: "0 0 0 80px",
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12, position: "relative" }}>
        <span style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 28, height: 28, borderRadius: ds.rSm,
          background: accentBg,
          color: accent,
          flexShrink: 0,
        }}>
          {icon}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700, color: ds.inkMute2,
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>
          {label}
        </span>
      </div>

      <p style={{
        margin: 0,
        fontSize: 28, fontWeight: 800,
        color: ds.ink,
        fontFamily: fontMono,
        lineHeight: 1,
        letterSpacing: "-0.02em",
        position: "relative",
      }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>

      {sub && (
        <p style={{ margin: "6px 0 0", fontSize: 11, color: ds.inkMute2, position: "relative" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

interface Props {
  data: PRTrackerData;
}

export function StatsGrid({ data }: Props) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))",
      gap: 10,
      marginBottom: 16,
    }}>
      <StatCard
        icon={<Trophy size={14} />}
        label="Total Points"
        value={data.totalPoints}
        sub={data.rank}
        accent="#24b47e"
        accentBg="rgba(36,180,126,0.07)"
      />
      <StatCard
        icon={<GitMerge size={14} />}
        label="Merged PRs"
        value={data.totalMergedGSSoC}
        sub="GSSoC merged"
        accent="#8b5cf6"
        accentBg="rgba(139,92,246,0.07)"
      />
      <StatCard
        icon={<CheckCircle size={14} />}
        label="Approved"
        value={data.totalApproved}
        sub="gssoc:approved"
        accent="#10b981"
        accentBg="rgba(16,185,129,0.07)"
      />
      <StatCard
        icon={<Building2 size={14} />}
        label="Repos"
        value={data.uniqueRepos}
        sub="contributed to"
        accent="#f59e0b"
        accentBg="rgba(245,158,11,0.07)"
      />
      <StatCard
        icon={<Flame size={14} />}
        label="Streak"
        value={data.streak}
        sub={data.streak === 1 ? "day" : "days"}
        accent="#ef4444"
        accentBg="rgba(239,68,68,0.07)"
      />
    </div>
  );
}
