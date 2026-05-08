"use client";
import { motion } from "framer-motion";
import { ds, fontMono } from "@/lib/ds";

const ROLE_BASE = [
  { role: "Contributor",  pts: 50,  color: "#166534", bg: "#f0fdf4", border: "#bbf7d0" },
  { role: "Ambassador",   pts: 70,  color: "#7e22ce", bg: "#fdf4ff", border: "#e9d5ff" },
  { role: "Mentor",       pts: 80,  color: "#92400e", bg: "#fffbeb", border: "#fde68a" },
  { role: "Project Admin",pts: 100, color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe" },
];

const CATEGORIES = [
  {
    key: "contributor", title: "Contributor", color: "#166534", bg: "#f0fdf4", border: "#bbf7d0",
    items: [
      { label: "Per merged PR",            pts: 30 },
      { label: "Per open PR",              pts: 10 },
      { label: "Good First Issue claimed", pts: 20 },
      { label: "Per issue closed",         pts: 15 },
      { label: "Per issue comment",        pts: 5  },
      { label: "PR links in application",  pts: 15 },
    ],
  },
  {
    key: "ambassador", title: "Ambassador", color: "#7e22ce", bg: "#fdf4ff", border: "#e9d5ff",
    items: [
      { label: "Per referral",   pts: 15 },
      { label: "Has social links",pts: 20 },
      { label: "Past events",    pts: 15 },
      { label: "Has reach plan", pts: 15 },
      { label: "Has promo plan", pts: 10 },
    ],
  },
  {
    key: "project-admin", title: "Project Admin", color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe",
    items: [
      { label: "Has beginner issues",      pts: 25 },
      { label: "Excellent README",         pts: 20 },
      { label: "Prior program experience", pts: 20 },
      { label: "5+ expected contributors", pts: 15 },
      { label: "Per good first issue",     pts: 5  },
      { label: "Per open GitHub issue",    pts: 2  },
      { label: "Good README",              pts: 10 },
    ],
  },
  {
    key: "mentor", title: "Mentor", color: "#92400e", bg: "#fffbeb", border: "#fde68a",
    items: [
      { label: "Has mentored before",    pts: 30 },
      { label: "Has portfolio links",    pts: 20 },
      { label: "10+ hrs / week",         pts: 15 },
      { label: "3+ expertise areas",     pts: 10 },
      { label: "Per year of experience", pts: 5  },
    ],
  },
];

export function ScoringSection() {
  return (
    <section id="scoring" style={{ background: ds.canvasSoft, padding: "96px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ maxWidth: 560, marginBottom: 56 }}>
          <p style={{
            margin: "0 0 10px", fontSize: 12, fontWeight: 700,
            color: ds.primaryDeep, letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            Scoring
          </p>
          <h2 style={{
            margin: "0 0 14px",
            fontSize: "clamp(26px, 3.5vw, 36px)", fontWeight: 700,
            color: ds.ink, letterSpacing: "-0.025em", lineHeight: 1.2,
          }}>
            How GSSoC 2026 points work
          </h2>
          <p style={{ margin: 0, fontSize: 16, color: ds.inkMute, lineHeight: 1.65 }}>
            Official scoring criteria for every role. Know exactly what contributes to your score.
          </p>
        </div>

        {/* Role base points */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 10,
          marginBottom: 40,
        }}>
          {ROLE_BASE.map(r => (
            <div key={r.role} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px",
              background: r.bg,
              border: `1px solid ${r.border}`,
              borderRadius: 10,
            }}>
              <div>
                <p style={{ margin: "0 0 1px", fontSize: 11, fontWeight: 600, color: r.color, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  {r.role}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: `${r.color}99` }}>Role base</p>
              </div>
              <span style={{
                fontSize: 22, fontWeight: 700, color: r.color,
                fontFamily: fontMono, letterSpacing: "-0.02em",
              }}>
                {r.pts}<span style={{ fontSize: 12, fontWeight: 400, marginLeft: 2 }}>pts</span>
              </span>
            </div>
          ))}
        </div>

        {/* Per-role breakdown grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}>
          {CATEGORIES.map((cat, ci) => (
            <motion.div key={cat.key}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: ci * 0.07 }}
              style={{
                background: ds.canvas,
                border: `1px solid ${ds.hairlineCool}`,
                borderRadius: 12,
                overflow: "hidden",
              }}>
              {/* Card header */}
              <div style={{
                padding: "12px 16px",
                background: cat.bg,
                borderBottom: `1px solid ${cat.border}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: cat.color,
                  letterSpacing: "0.06em", textTransform: "uppercase",
                }}>
                  {cat.title}
                </span>
                <span style={{
                  fontSize: 10, color: cat.color, opacity: 0.65,
                  fontFamily: fontMono,
                }}>
                  {cat.items.length} criteria
                </span>
              </div>

              {/* Items */}
              {cat.items.map((item, ii) => (
                <div key={item.label} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "9px 16px",
                  background: ii % 2 === 0 ? ds.canvas : "#fafafa",
                  borderBottom: ii < cat.items.length - 1 ? `1px solid ${ds.hairlineCool}` : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      width: 4, height: 4, borderRadius: "50%",
                      background: cat.color, opacity: 0.6,
                      display: "inline-block", flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 12, color: ds.inkMute }}>{item.label}</span>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 700, fontFamily: fontMono,
                    color: cat.color,
                    padding: "1px 8px", borderRadius: 99,
                    background: cat.bg, border: `1px solid ${cat.border}`,
                    flexShrink: 0, marginLeft: 8,
                  }}>
                    +{item.pts}
                  </span>
                </div>
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
