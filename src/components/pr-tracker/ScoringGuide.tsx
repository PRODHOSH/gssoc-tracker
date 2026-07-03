"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Info, X } from "lucide-react";
import { ds, fontMono } from "@/lib/ds";
import { getLabelChipColors } from "@/lib/labelColors";

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
const BLOCKING = [
  { label: "gssoc:invalid", value: "0 pts" },
  { label: "gssoc:spam",    value: "0 pts" },
  { label: "gssoc:ai-slop", value: "0 pts" },
];

function LabelChip({ label }: { label: string }) {
  const c = getLabelChipColors(label);
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

function Section({ title, rows, isMultiplier = false, accent, footnote }: {
  title: string;
  rows: { label: string; value: string; note?: string }[];
  isMultiplier?: boolean;
  accent?: string;
  footnote?: string;
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
                color: accent ?? (isMultiplier ? "#1e40af" : ds.primaryDeep),
                minWidth: 50, textAlign: "right",
              }}>
                {r.value}
              </span>
            </div>
          </div>
        ))}
      </div>
      {footnote && (
        <p style={{ margin: "8px 0 0", fontSize: 11, color: ds.inkFaint, lineHeight: 1.5 }}>
          {footnote}
        </p>
      )}
    </div>
  );
}

function Modal({ onClose }: { onClose: () => void }) {
  return createPortal(
    <div
      className="light"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(23,23,23,0.45)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
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
              Formula: 50 + (difficulty × quality) + type_bonus, capped at 175/PR
            </p>
          </div>
          <button
            onClick={onClose}
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
          <Section
            title="Difficulty"
            rows={DIFF}
            footnote="Multiple level labels on one PR? Only the lowest counts — labels can't be stacked to inflate points."
          />
          <Section
            title="Quality Multiplier"
            rows={QUAL}
            isMultiplier
            footnote="Multiple quality labels? The lowest counts."
          />
          <Section
            title="Type Bonus"
            rows={TYPES}
            footnote="Every PR is capped at 175 pts total, no matter how many labels are applied."
          />
          <Section
            title="Blocking Labels"
            rows={BLOCKING}
            accent="#dc2626"
            footnote="Any of these override gssoc:approved — the PR scores 0 pts regardless of other labels."
          />

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

export function ScoringGuide() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "5px 11px",
          borderRadius: ds.rSm,
          border: `1.5px solid ${ds.hairline}`,
          background: ds.canvas,
          color: ds.inkMute2,
          fontSize: 12, fontWeight: 600,
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
        <Info size={11} />
        Points System
      </button>

      {mounted && open && <Modal onClose={() => setOpen(false)} />}
    </>
  );
}
