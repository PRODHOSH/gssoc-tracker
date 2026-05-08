"use client";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Bell, RefreshCw, GitBranch, Shield } from "lucide-react";
import { ds } from "@/lib/ds";

const FEATURES = [
  {
    icon: <BarChart3 size={18} />,
    label: "Score Analytics",
    title: "Every point, explained",
    desc: "See your total score, per-role breakdown, and how each criterion contributes — Ambassador referrals, contributor PRs, and more.",
    accent: ds.primaryDeep,
    accentBg: "rgba(36,180,126,0.08)",
    accentBorder: "rgba(36,180,126,0.2)",
  },
  {
    icon: <TrendingUp size={18} />,
    label: "Rank Tracking",
    title: "Watch your rank move",
    desc: "Visualise your global rank trajectory over time with interactive charts. Inverted axis — climbing always looks like going up.",
    accent: "#ca8a04",
    accentBg: "rgba(202,138,4,0.08)",
    accentBorder: "rgba(202,138,4,0.2)",
  },
  {
    icon: <Bell size={18} />,
    label: "Email Alerts",
    title: "Never miss an update",
    desc: "Instant change alerts via Gmail SMTP when your score or rank moves. Daily digest at 8 AM IST — automated by GitHub Actions.",
    accent: "#7c3aed",
    accentBg: "rgba(124,58,237,0.08)",
    accentBorder: "rgba(124,58,237,0.2)",
  },
  {
    icon: <RefreshCw size={18} />,
    label: "Auto Sync",
    title: "Syncs every 6 hours",
    desc: "GitHub Actions polls the GSSoC API on a schedule. Data commits back to your repo — full history, always available.",
    accent: "#0284c7",
    accentBg: "rgba(2,132,199,0.08)",
    accentBorder: "rgba(2,132,199,0.2)",
  },
  {
    icon: <GitBranch size={18} />,
    label: "Open Source",
    title: "Fork and own your data",
    desc: "All data is stored as JSON in your own repository. No third-party database. No rate limits. Full control.",
    accent: ds.inkMute,
    accentBg: ds.canvasSoft,
    accentBorder: ds.hairline,
  },
  {
    icon: <Shield size={18} />,
    label: "Any Profile",
    title: "Track anyone on GSSoC",
    desc: "Enter any participant's GitHub username to see their live dashboard. History tracking is available for the repo owner.",
    accent: "#be185d",
    accentBg: "rgba(190,24,93,0.08)",
    accentBorder: "rgba(190,24,93,0.2)",
  },
];

export function Features() {
  return (
    <section id="features" style={{ background: ds.canvas, padding: "96px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Section header */}
        <div style={{ maxWidth: 560, marginBottom: 56 }}>
          <p style={{
            margin: "0 0 10px", fontSize: 12, fontWeight: 700,
            color: ds.primaryDeep, letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            Features
          </p>
          <h2 style={{
            margin: "0 0 14px",
            fontSize: "clamp(26px, 3.5vw, 36px)", fontWeight: 700,
            color: ds.ink, letterSpacing: "-0.025em", lineHeight: 1.2,
          }}>
            Everything you need to stay ahead
          </h2>
          <p style={{ margin: 0, fontSize: 16, color: ds.inkMute, lineHeight: 1.65 }}>
            Built specifically for GSSoC 2026. Live data from the official API,
            cached and served fast.
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 1,
          background: ds.hairlineCool,
          border: `1px solid ${ds.hairlineCool}`,
          borderRadius: 14,
          overflow: "hidden",
        }}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.label}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              style={{
                background: ds.canvas,
                padding: 28,
              }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: f.accentBg, border: `1px solid ${f.accentBorder}`,
                color: f.accent,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}>
                {f.icon}
              </div>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: f.accent, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {f.label}
              </p>
              <p style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 600, color: ds.ink }}>
                {f.title}
              </p>
              <p style={{ margin: 0, fontSize: 13, color: ds.inkMute, lineHeight: 1.65 }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
