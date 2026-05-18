import Image from "next/image";
import { MapPin, Building2, Users, BookOpen, ExternalLink } from "lucide-react";
import { ds, fontMono } from "@/lib/ds";
import { GitHubIcon } from "@/components/icons";
import type { GitHubUser, PRRank } from "@/types/pr-tracker";

const RANK_META: Record<PRRank, {
  label: string; emoji: string;
  pill: string; pillText: string; pillBorder: string;
  glow: string;
}> = {
  "Beginner Contributor":  { label: "Beginner Contributor",  emoji: "🌱", pill: "#f0fdf4", pillText: "#166534", pillBorder: "#86efac", glow: "rgba(34,197,94,0.12)" },
  "Active Contributor":    { label: "Active Contributor",    emoji: "⚡", pill: "#eff6ff", pillText: "#1e40af", pillBorder: "#93c5fd", glow: "rgba(59,130,246,0.12)" },
  "Advanced Contributor":  { label: "Advanced Contributor",  emoji: "🚀", pill: "#fdf4ff", pillText: "#7e22ce", pillBorder: "#d8b4fe", glow: "rgba(168,85,247,0.12)" },
  "Elite Contributor":     { label: "Elite Contributor",     emoji: "🏆", pill: "#fffbeb", pillText: "#92400e", pillBorder: "#fcd34d", glow: "rgba(245,158,11,0.12)" },
  "GSSoC Legend":          { label: "GSSoC Legend",          emoji: "👑", pill: "#fff7ed", pillText: "#c2410c", pillBorder: "#fb923c", glow: "rgba(249,115,22,0.15)" },
};

interface Props {
  user: GitHubUser;
  rank: PRRank;
  totalPoints: number;
}

export function GitHubProfileCard({ user, rank, totalPoints }: Props) {
  const rm = RANK_META[rank];

  return (
    <div style={{
      background: ds.canvas,
      border: `1px solid ${ds.hairlineCool}`,
      borderRadius: ds.rXl,
      overflow: "hidden",
      boxShadow: "0 2px 12px rgba(23,23,23,0.07)",
      marginBottom: 16,
    }}>
      {/* Banner */}
      <div style={{
        height: 72,
        background: `linear-gradient(135deg, #0d1117 0%, #161b22 40%, #1c2128 100%)`,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle grid dots */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `radial-gradient(circle, rgba(62,207,142,0.15) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }} />
        {/* Glow */}
        <div style={{
          position: "absolute", right: -40, top: -40,
          width: 160, height: 160,
          borderRadius: "50%",
          background: rm.glow,
          filter: "blur(40px)",
        }} />
      </div>

      {/* Content */}
      <div style={{ padding: "0 24px 20px", position: "relative" }}>
        {/* Avatar row — sits on banner edge */}
        <div style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
          marginTop: -28,
          marginBottom: 14,
        }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: 72, height: 72,
              borderRadius: "50%",
              border: `3px solid ${ds.canvas}`,
              background: ds.canvas,
              boxShadow: "0 2px 8px rgba(23,23,23,0.14)",
              overflow: "hidden",
            }}>
              <Image
                src={user.avatar_url}
                alt={user.login}
                width={72}
                height={72}
                unoptimized
                style={{ display: "block" }}
              />
            </div>
            <span style={{
              position: "absolute", bottom: 0, right: 0,
              fontSize: 16, lineHeight: 1,
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))",
            }}>
              {rm.emoji}
            </span>
          </div>

          {/* Points box */}
          <div style={{
            padding: "10px 18px",
            background: "rgba(62,207,142,0.06)",
            border: "1.5px solid rgba(62,207,142,0.2)",
            borderRadius: ds.rLg,
            textAlign: "center",
            minWidth: 120,
            flexShrink: 0,
          }}>
            <p style={{ margin: "0 0 1px", fontSize: 10, fontWeight: 700, color: ds.inkMute2, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              GSSoC Points
            </p>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: ds.primaryDeep, fontFamily: fontMono, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              {totalPoints.toLocaleString()}
            </p>
            <p style={{ margin: "3px 0 0", fontSize: 10, color: ds.inkMute2 }}>total earned</p>
          </div>
        </div>

        {/* Name + handle */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: ds.ink, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              {user.name ?? user.login}
            </span>
            <a
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: ds.inkMute2, textDecoration: "none" }}
            >
              <GitHubIcon width={12} height={12} />
              @{user.login}
              <ExternalLink size={10} />
            </a>
          </div>

          {/* Rank pill */}
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: ds.rFull,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.01em",
            background: rm.pill, color: rm.pillText, border: `1px solid ${rm.pillBorder}`,
          }}>
            {rm.emoji} {rank}
          </span>
        </div>

        {/* Bio */}
        {user.bio && (
          <p style={{ margin: "0 0 12px", fontSize: 13, color: ds.inkMute, lineHeight: 1.6, maxWidth: 540 }}>
            {user.bio}
          </p>
        )}

        {/* Meta row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          {user.location && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: ds.inkMute2 }}>
              <MapPin size={11} /> {user.location}
            </span>
          )}
          {user.company && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: ds.inkMute2 }}>
              <Building2 size={11} /> {user.company.replace(/^@/, "")}
            </span>
          )}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: ds.inkMute2 }}>
            <Users size={11} /> <strong style={{ color: ds.inkMute, fontWeight: 600 }}>{user.followers.toLocaleString()}</strong> followers
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: ds.inkMute2 }}>
            <BookOpen size={11} /> <strong style={{ color: ds.inkMute, fontWeight: 600 }}>{user.public_repos}</strong> repos
          </span>
        </div>
      </div>
    </div>
  );
}
