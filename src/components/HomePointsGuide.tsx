"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Info, X, GitPullRequest, Users } from "lucide-react";
import { ds, fontMono } from "@/lib/ds";
import { getLabelChipColors } from "@/lib/labelColors";

/* ── Contributor data ────────────────────────────────────────── */
const C_DIFF = [
  { label: "level:beginner",     value: "20 pts" },
  { label: "level:intermediate", value: "35 pts" },
  { label: "level:advanced",     value: "55 pts" },
  { label: "level:critical",     value: "80 pts" },
];
const C_QUAL = [
  { label: "quality:clean",       value: "×1.2" },
  { label: "quality:exceptional", value: "×1.5" },
];
const C_TYPES = [
  { label: "type:docs",          value: "+5 pts"  },
  { label: "type:testing",       value: "+10 pts" },
  { label: "type:design",        value: "+10 pts" },
  { label: "type:refactor",      value: "+10 pts" },
  { label: "type:bug",           value: "+10 pts" },
  { label: "type:feature",       value: "+10 pts" },
  { label: "type:accessibility", value: "+15 pts" },
  { label: "type:performance",   value: "+15 pts" },
  { label: "type:devops",        value: "+15 pts" },
  { label: "type:security",      value: "+20 pts" },
];
const C_BLOCKING = [
  { label: "gssoc:invalid", value: "0 pts" },
  { label: "gssoc:spam",    value: "0 pts" },
  { label: "gssoc:ai-slop", value: "0 pts" },
];

/* ── Mentor data ─────────────────────────────────────────────── */
const M_LEVELS = [
  { label: "level:beginner",     value: "10 pts" },
  { label: "level:intermediate", value: "20 pts" },
  { label: "level:advanced",     value: "30 pts" },
  { label: "level:critical",     value: "50 pts" },
];
const M_QUAL = [
  { label: "quality:clean",       value: "+5 pts"  },
  { label: "quality:exceptional", value: "+10 pts" },
];

/* ── Shared primitives ───────────────────────────────────────── */
function LabelChip({ label }: { label: string }) {
  const c = getLabelChipColors(label);
  return (
    <span style={{ display: "inline-block", padding: "2px 9px", borderRadius: ds.rFull, fontSize: 12, fontWeight: 600, fontFamily: fontMono, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {label}
    </span>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <LabelChip label={label} />
      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: fontMono, color: accent, minWidth: 50, textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

function Section({ title, rows, accent, isMultiplier = false, footnote }: { title: string; rows: { label: string; value: string }[]; accent: string; isMultiplier?: boolean; footnote?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 800, color: ds.inkMute2, letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {title}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {rows.map((r) => <Row key={r.label} label={r.label} value={r.value} accent={isMultiplier ? "#1e40af" : accent} />)}
      </div>
      {footnote && (
        <p style={{ margin: "8px 0 0", fontSize: 11, color: ds.inkFaint, lineHeight: 1.5 }}>
          {footnote}
        </p>
      )}
    </div>
  );
}

/* ── Tab content ─────────────────────────────────────────────── */
function ContributorTab() {
  return (
    <div style={{ padding: "20px", overflowY: "auto" }}>
      <Section title="Base (every approved PR)" rows={[{ label: "gssoc:approved", value: "+50 pts" }]} accent={ds.primaryDeep} />
      <Section
        title="Difficulty"
        rows={C_DIFF}
        accent={ds.primaryDeep}
        footnote="Multiple level labels on one PR? Only the lowest counts — labels can't be stacked to inflate points."
      />
      <Section
        title="Quality Multiplier"
        rows={C_QUAL}
        accent={ds.primaryDeep}
        isMultiplier
        footnote="Multiple quality labels? The lowest counts. quality:exceptional also needs a substantive mentor review comment (over 30 characters) — without one it falls back to ×1.0."
      />
      <Section
        title="Type Bonus"
        rows={C_TYPES}
        accent={ds.primaryDeep}
        footnote="Every PR is capped at 175 pts total, no matter how many labels are applied."
      />
      <Section
        title="Blocking Labels"
        rows={C_BLOCKING}
        accent="#dc2626"
        footnote="Any of these override gssoc:approved — the PR scores 0 pts regardless of other labels."
      />
      <div style={{ background: "rgba(62,207,142,0.05)", border: "1px solid rgba(62,207,142,0.2)", borderRadius: ds.rMd, padding: "12px 14px" }}>
        <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: ds.primaryDeep, letterSpacing: "0.06em", textTransform: "uppercase" }}>Example</p>
        <p style={{ margin: "0 0 4px", fontSize: 12, color: ds.inkMute, fontFamily: fontMono, wordBreak: "break-word" }}>gssoc:approved + level:advanced + quality:exceptional + type:devops</p>
        <p style={{ margin: 0, fontSize: 13, color: ds.ink, fontFamily: fontMono, fontWeight: 600 }}>
          = 50 + (55 × 1.5) + 15 = <span style={{ color: ds.primaryDeep }}>147 pts</span>
        </p>
      </div>
      <p style={{ margin: "16px 0 0", fontSize: 11, color: ds.inkFaint, textAlign: "center", lineHeight: 1.6 }}>
        Full label guide:{" "}
        <a
          href="https://gssoc.girlscript.org/guidelines/labeling"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: ds.primaryDeep, fontWeight: 600, textDecoration: "none" }}
        >
          gssoc.girlscript.org/guidelines/labeling
        </a>
      </p>
    </div>
  );
}

function MentorTab() {
  return (
    <div style={{ padding: "20px", overflowY: "auto" }}>
      <Section title="Level Base (per reviewed PR)" rows={M_LEVELS} accent="#ca8a04" />
      <Section title="Quality Bonus" rows={M_QUAL} accent="#ca8a04" />
      <div style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: ds.rMd, padding: "12px 14px" }}>
        <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "#92400e", letterSpacing: "0.06em", textTransform: "uppercase" }}>Example</p>
        <p style={{ margin: "0 0 4px", fontSize: 12, color: ds.inkMute, fontFamily: fontMono }}>level:advanced + quality:exceptional</p>
        <p style={{ margin: 0, fontSize: 13, color: ds.ink, fontFamily: fontMono, fontWeight: 600 }}>
          = 30 + 10 = <span style={{ color: "#ca8a04" }}>40 pts</span>
        </p>
      </div>
      <p style={{ margin: "16px 0 0", fontSize: 11, color: ds.inkFaint, lineHeight: 1.6 }}>
        Only PRs labeled{" "}
        <span style={{ fontFamily: fontMono, fontSize: 11 }}>mentor:username</span> +{" "}
        <span style={{ fontFamily: fontMono, fontSize: 11 }}>gssoc:approved</span> are counted.
      </p>
    </div>
  );
}

/* ── Modal ───────────────────────────────────────────────────── */
function Modal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"contributor" | "mentor">("contributor");

  const tabs = [
    { id: "contributor" as const, label: "Contributor", icon: <GitPullRequest size={12} />, accent: ds.primaryDeep, activeBg: "rgba(62,207,142,0.08)", activeBorder: ds.primaryDeep },
    { id: "mentor"      as const, label: "Mentor",      icon: <Users size={12} />,          accent: "#ca8a04",      activeBg: "rgba(251,191,36,0.08)", activeBorder: "#ca8a04"      },
  ];

  return createPortal(
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(23,23,23,0.45)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: ds.canvas, borderRadius: ds.rXl, boxShadow: "0 24px 64px rgba(23,23,23,0.18)", width: "100%", maxWidth: 440, maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column", animation: "slideUp 0.2s ease" }}
      >
        {/* Header */}
        <div style={{ padding: "16px 20px 14px", borderBottom: `1px solid ${ds.hairlineCool}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: ds.ink }}>Points System</p>
          <button onClick={onClose} style={{ width: 28, height: 28, border: `1px solid ${ds.hairlineCool}`, borderRadius: ds.rSm, background: "transparent", color: ds.inkMute2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, padding: "10px 20px 0", borderBottom: `1px solid ${ds.hairlineCool}`, flexShrink: 0 }}>
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  borderTop:    `1px solid ${active ? t.activeBorder : "transparent"}`,
                  borderLeft:   `1px solid ${active ? t.activeBorder : "transparent"}`,
                  borderRight:  `1px solid ${active ? t.activeBorder : "transparent"}`,
                  borderBottom: "none",
                  borderRadius: `${ds.rSm} ${ds.rSm} 0 0`,
                  background: active ? t.activeBg : "transparent",
                  color: active ? t.accent : ds.inkMute2,
                  marginBottom: -1,
                  transition: "all 0.12s",
                }}
              >
                {t.icon} {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab body */}
        <div style={{ overflowY: "auto" }}>
          {tab === "contributor" ? <ContributorTab /> : <MentorTab />}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>,
    document.body
  );
}

/* ── Button ──────────────────────────────────────────────────── */
export function HomePointsGuide() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: ds.rSm, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(62,207,142,0.4)"; e.currentTarget.style.color = ds.primary; e.currentTarget.style.background = "rgba(62,207,142,0.07)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
      >
        <Info size={12} /> Points System
      </button>
      {mounted && open && <Modal onClose={() => setOpen(false)} />}
    </>
  );
}
