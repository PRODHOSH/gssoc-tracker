"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Trophy, Users, Star, GitPullRequest } from "lucide-react";
import { ProfileSnapshot, HistoryEntry } from "@/types";
import { ds, fontMono, ROLE_STYLE } from "@/lib/ds";

interface StatsGridProps {
  profile: ProfileSnapshot;
  history: HistoryEntry[];
}

interface StatCard {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  icon: React.ReactNode;
  accent?: string;
}

export function StatsGrid({ profile: p, history }: StatsGridProps) {
  const last = history.length >= 2 ? history[history.length - 2] : null;
  const scoreChange = last ? p.score - last.score : 0;
  const rankChange  = last ? p.rank  - last.rank  : 0;

  const cards: StatCard[] = [
    {
      label: "Total Score",
      value: p.score.toLocaleString(),
      sub: scoreChange !== 0 ? `${scoreChange > 0 ? "+" : ""}${scoreChange} this update` : "No change",
      subColor: scoreChange > 0 ? ds.primaryDeep : scoreChange < 0 ? "#dc2626" : ds.inkMute2,
      icon: <Star size={16} />,
      accent: ds.primary,
    },
    {
      label: "Global Rank",
      value: `#${p.rank}`,
      sub: rankChange !== 0
        ? rankChange < 0 ? `↑ ${Math.abs(rankChange)} places improved` : `↓ ${rankChange} places dropped`
        : "Holding position",
      subColor: rankChange < 0 ? ds.primaryDeep : rankChange > 0 ? "#dc2626" : ds.inkMute2,
      icon: <Trophy size={16} />,
      accent: "#ca8a04",
    },
    {
      label: "Ambassador Score",
      value: (p.role_scores["ambassador"] ?? 0).toLocaleString(),
      sub: "Referrals + outreach",
      subColor: ds.inkMute2,
      icon: <Users size={16} />,
      accent: "#7e22ce",
    },
    {
      label: "Contributor Score",
      value: (p.role_scores["contributor"] ?? 0).toLocaleString(),
      sub: "PRs + open source",
      subColor: ds.inkMute2,
      icon: <GitPullRequest size={16} />,
      accent: "#166534",
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.3 }}
          style={{
            background: ds.canvas,
            border: `1px solid ${ds.hairlineCool}`,
            borderRadius: ds.rLg,
            padding: "18px 20px",
            boxShadow: "0 1px 3px rgba(23,23,23,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <p style={{ margin: 0, fontSize: ds.fsMicro, fontWeight: 600, color: ds.inkMute, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {card.label}
            </p>
            <span style={{ color: card.accent ?? ds.inkMute2, opacity: 0.8 }}>{card.icon}</span>
          </div>
          <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: ds.ink, fontFamily: fontMono, letterSpacing: "-0.02em", marginBottom: 4 }}>
            {card.value}
          </p>
          {card.sub && (
            <p style={{ margin: 0, fontSize: 12, color: card.subColor ?? ds.inkMute2 }}>
              {card.sub}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
