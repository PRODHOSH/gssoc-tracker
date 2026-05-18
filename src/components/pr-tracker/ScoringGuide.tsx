"use client";
import { useState } from "react";
import { Info, X } from "lucide-react";
import { ds, fontMono } from "@/lib/ds";

/* ── Data ── */
const BASE   = [{ label: "gssoc:approved", value: "+50 pts", note: "every approved PR" }];
const DIFF   = [
  { label: "level:beginner",      value: "20 pts" },
  { label: "level:intermediate",  value: "35 pts" },
  { label: "level:advanced",      value: "55 pts" },
  { label: "level:critical",      value: "80 pts" },
];
const QUAL   = [
  { label: "quality:clean",       value: "×1.2" },
  { label: "quality:exceptional", value: "×1.5" },
];
const TYPES  = [
  { label: "type:docs",           value: "+5 pts"  },
  { label: "type:testing",        value: "+10 pts" },
  { label: "type:design",         value: "+10 pts" },
  { label: "type:refactor",       value: "+10 pts" },
  { label: "type:bug",            value: "+10 pts" },
  { label: "type:feature",        value: "+10 pts" },
  { label: "type:accessibility",  value: "+15 pts" },
  { label: "type:performance",    value: "+15 pts" },
  { label: "type:devops",         value: "+15 pts" },
  { label: "type:security",       value: "+20 pts" },
];

/* ── Label chip colours ── */
function chip(label: string): { bg: string; color: string; border: string } {
  if (label.startsWith("gssoc"))   return { bg: "#f0fdf4", color: "#166534", border: "#86efac" };
  if (label.startsWith("level"))   return { bg: "#fdf4ff", color: "#7e22ce", border: "#d8b4fe" };
  if (label.startsWith("quality")) return { bg: "#eff6ff", color: "#1e40af", border: "#93c5fd" };
  if (label.startsWith("type"))    return { bg: "#fff7ed", color: "#c2410c", border: "#fdba74" };
  return { bg: ds.canvasSoft, color: ds.inkMute, border: ds.hairline };
}

function LabelChip({ label }: { label: string }) {
  const c = chip(label);
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 9px",
      borderRadius: ds.rFull,
      fontSize: 12, fontWeight: 600,
      fontFamily: fontMono,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>
      {label}
    </span>
  );
}

function Section({ title, rows, isMultiplier = false }: {
  title: string;
  rows: { label: string; value: string; note?: string }[];
  isMultiplier?: boolean;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{
        margin: "0 0 10px",
        fontSize: 10, fontWeight: 800,
        color: ds.inkMute2,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}>
        {title}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {rows.map((r) => (
          <div key={r.label} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          }}>
            <LabelChip label={r.label} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {r.note && (
                <span style={{ fontSize: 11, color: ds.inkFaint }}>{r.note}</span>
              )}
              <span style={{
                fontSize: 13, fontWeight: 700,
                fontFamily: fontMono,
                color: isMultiplier ? "#1e40af" : ds.primaryDeep,
                minWidth: 50, textAlign: "right",
              }}>
                {r.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScoringGuide() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        title="Scoring guide"
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 28, height: 28,
          borderRadius: "50%",
          border: `1.5px solid ${ds.hairline}`,
          background: ds.canvas,
          color: ds.inkMute2,
          cursor: "pointer",
          transition: "all 0.15s",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = ds.primary;
          e.currentTarget.style.color = ds.primaryDeep;
          e.currentTarget.style.background = "rgba(62,207,142,0.06)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = ds.hairline;
          e.currentTarget.style.color = ds.inkMute2;
          e.currentTarget.style.background = ds.canvas;
        }}
      >
        <Info size={13} />
      </button>

      {/* Modal backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(23,23,23,0.45)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
        >
          {/* Panel */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: ds.canvas,
              borderRadius: ds.rXl,
              boxShadow: "0 24px 64px rgba(23,23,23,0.18)",
              width: "100%", maxWidth: 420,
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex", flexDirection: "column",
              animation: "slideUp 0.2s ease",
            }}
          >
            {/* Header */}
            <div style={{
              padding: "18px 20px 16px",
              borderBottom: `1px solid ${ds.hairlineCool}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexShrink: 0,
            }}>
              <div>
                <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 700, color: ds.ink }}>
                  Scoring Guide
                </p>
                <p style={{ margin: 0, fontSize: 11, color: ds.inkMute2, fontFamily: fontMono }}>
                  Formula: 50 + (difficulty × quality) + type_bonus
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: 28, height: 28,
                  border: `1px solid ${ds.hairlineCool}`,
                  borderRadius: ds.rSm,
                  background: "transparent",
                  color: ds.inkMute2,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Scrollable body */}
            <div style={{ padding: "20px", overflowY: "auto" }}>
              <Section title="Base (every approved PR)" rows={BASE} />
              <Section title="Difficulty" rows={DIFF} />
              <Section title="Quality Multiplier" rows={QUAL} isMultiplier />
              <Section title="Type Bonus" rows={TYPES} />

              {/* Example */}
              <div style={{
                background: "rgba(62,207,142,0.05)",
                border: "1px solid rgba(62,207,142,0.2)",
                borderRadius: ds.rMd,
                padding: "12px 14px",
              }}>
                <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: ds.primaryDeep, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Example
                </p>
                <p style={{ margin: "0 0 4px", fontSize: 12, color: ds.inkMute, fontFamily: fontMono }}>
                  gssoc:approved + level:advanced + quality:exceptional + type:devops
                </p>
                <p style={{ margin: 0, fontSize: 13, color: ds.ink, fontFamily: fontMono, fontWeight: 600 }}>
                  = 50 + (55 × 1.5) + 15 = <span style={{ color: ds.primaryDeep }}>147 pts</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
