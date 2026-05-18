"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ds } from "@/lib/ds";
import type { TrackedPR } from "@/types/pr-tracker";

const LABEL_GROUP_COLORS: Record<string, string> = {
  "gssoc:approved":      "#10b981",
  "gssoc:invalid":       "#ef4444",
  "gssoc:spam":          "#f59e0b",
  "gssoc:ai-slop":       "#f97316",
  "level:beginner":      "#34d399",
  "level:intermediate":  "#fbbf24",
  "level:advanced":      "#a78bfa",
  "level:critical":      "#f87171",
  "quality:clean":       "#60a5fa",
  "quality:exceptional": "#818cf8",
  other:                 ds.hairlineStrong,
};

interface Props {
  allPRs: TrackedPR[];
}

export function LabelsPieChart({ allPRs }: Props) {
  const freq: Record<string, number> = {};
  const colorMap: Record<string, string> = {};

  for (const pr of allPRs) {
    for (const label of pr.labels) {
      freq[label] = (freq[label] ?? 0) + 1;
      colorMap[label] = pr.labelColors[label] ?? LABEL_GROUP_COLORS[label] ?? LABEL_GROUP_COLORS.other;
    }
  }

  const data = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([name, value]) => ({ name, value }));

  if (!data.length) {
    return (
      <div style={{
        background: ds.canvas, border: `1px solid ${ds.hairlineCool}`,
        borderRadius: ds.rLg, padding: 20,
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: 220,
      }}>
        <p style={{ color: ds.inkFaint, fontSize: 13 }}>No label data</p>
      </div>
    );
  }

  return (
    <div style={{
      background: ds.canvas,
      border: `1px solid ${ds.hairlineCool}`,
      borderRadius: ds.rLg,
      padding: "18px 20px",
      boxShadow: "0 1px 4px rgba(23,23,23,0.04)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: ds.ink }}>Label Distribution</p>
        <span style={{ fontSize: 11, color: ds.inkFaint }}>by frequency</span>
      </div>

      {/* Pie — no Legend inside, so full height is used for the chart */}
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={85}
            innerRadius={44}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={colorMap[entry.name] ?? LABEL_GROUP_COLORS.other} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: ds.canvas,
              border: `1px solid ${ds.hairline}`,
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v) => [`${v} PR${Number(v) !== 1 ? "s" : ""}`, ""]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Custom legend — outside the chart so spacing is controlled */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px 16px",
        marginTop: 16,
        paddingTop: 14,
        borderTop: `1px solid ${ds.hairlineCool}`,
      }}>
        {data.map((entry) => (
          <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
              background: colorMap[entry.name] ?? LABEL_GROUP_COLORS.other,
            }} />
            <span style={{ fontSize: 11, color: ds.inkMute, whiteSpace: "nowrap" }}>
              {entry.name}
            </span>
            <span style={{ fontSize: 11, color: ds.inkFaint, fontWeight: 600 }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
