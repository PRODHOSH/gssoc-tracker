"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, GraduationCap } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import { ProfileSnapshot } from "@/types";
import { ds, fontMono, ROLE_STYLE } from "@/lib/ds";

interface HeaderProps {
  profile: ProfileSnapshot;
  rankChange: number;
  scoreChange: number;
  lastSynced: string;
}

export function Header({ profile: p, rankChange, scoreChange, lastSynced }: HeaderProps) {
  const synced = new Date(lastSynced).toLocaleString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div style={{
      background: ds.canvasNight,
      borderRadius: ds.rLg,
      overflow: "hidden",
      marginBottom: 20,
    }}>
      {/* Top bar */}
      <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>

          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            {p.avatar_url ? (
              <Image
                src={p.avatar_url}
                alt={p.name}
                width={72}
                height={72}
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: `2px solid rgba(62,207,142,0.35)`,
                  flexShrink: 0,
                }}
                unoptimized
              />
            ) : (
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: ds.canvasNightSoft,
                color: "rgba(255,255,255,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, fontWeight: 600,
                border: `2px solid rgba(255,255,255,0.1)`,
                flexShrink: 0,
              }}>
                {p.name.charAt(0)}
              </div>
            )}
          </motion.div>

          {/* Name + meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <motion.h1
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 600,
                color: ds.onDark,
                letterSpacing: "-0.02em",
                marginBottom: 6,
              }}
            >
              {p.name}
            </motion.h1>

            {/* Role badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
              {p.accepted_roles.map(r => {
                const s = ROLE_STYLE[r.toLowerCase()] ?? { bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "rgba(255,255,255,0.1)" };
                return (
                  <span key={r} style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 8px",
                    borderRadius: ds.rFull,
                    background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                  }}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </span>
                );
              })}
            </div>

            {/* Meta row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              {p.city && (
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={12} /> {p.city}
                </span>
              )}
              {p.college && (
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <GraduationCap size={12} /> {p.college}
                </span>
              )}
              {p.github_id && (
                <a href={`https://github.com/${p.github_id}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
                  <GitHubIcon width={12} height={12} /> @{p.github_id}
                </a>
              )}
              {p.linkedin_url && (
                <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
                  <LinkedInIcon width={12} height={12} /> LinkedIn
                </a>
              )}
            </div>
          </div>

          {/* Score + Rank — right side */}
          <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
            <div style={{
              textAlign: "center",
              padding: "12px 20px",
              background: "rgba(62,207,142,0.08)",
              border: `1px solid rgba(62,207,142,0.2)`,
              borderRadius: ds.rMd,
            }}>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(62,207,142,0.6)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>Score</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: ds.primary, fontFamily: fontMono, letterSpacing: "-0.02em" }}>
                {p.score.toLocaleString()}
              </p>
              {scoreChange !== 0 && (
                <p style={{ margin: "3px 0 0", fontSize: 12, color: scoreChange > 0 ? ds.primary : "#f87171", fontFamily: fontMono }}>
                  {scoreChange > 0 ? "+" : ""}{scoreChange}
                </p>
              )}
            </div>
            <div style={{
              textAlign: "center",
              padding: "12px 20px",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid rgba(255,255,255,0.08)`,
              borderRadius: ds.rMd,
            }}>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>Rank</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: ds.onDark, fontFamily: fontMono, letterSpacing: "-0.02em" }}>
                #{p.rank}
              </p>
              {rankChange !== 0 && (
                <p style={{ margin: "3px 0 0", fontSize: 12, color: rankChange < 0 ? ds.primary : "#f87171", fontFamily: fontMono }}>
                  {rankChange < 0 ? `↑ ${Math.abs(rankChange)}` : `↓ ${rankChange}`}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom meta bar */}
      <div style={{
        padding: "10px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
      }}>
        {/* Tracks */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {p.tracks.map(t => (
            <span key={t} style={{
              fontSize: 11, fontWeight: 500, padding: "2px 8px",
              borderRadius: ds.rFull,
              background: "rgba(62,207,142,0.07)",
              color: "rgba(62,207,142,0.7)",
              border: "1px solid rgba(62,207,142,0.15)",
            }}>
              {t}
            </span>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
          Synced {synced}
        </p>
      </div>
    </div>
  );
}
