"use client";
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from "recharts";
import { ds } from "@/lib/ds";
import type { TrackedPR } from "@/types/pr-tracker";

const DIFF_COLORS: Record<string, string> = {
  "level:beginner":     "#10b981",
  "level:intermediate": "#f59e0b",
  "level:advanced":     "#8b5cf6",
  "level:critical":     "#ef4444",
  "unspecified":        ds.hairlineStrong,
};

const DIFF_LABELS: Record<string, string> = {
  "level:beginner":     "Beginner",
  "level:intermediate": "Intermediate",
  "level:advanced":     "Advanced",
  "level:critical":     "Critical",
  "unspecified":        "Unspecified",
};

interface Props {
  validPRs: TrackedPR[];
}

export function DifficultyChart({ validPRs }: Props) {
  const counts: Record<string, number> = {};
  const points: Record<string, number> = {};

  for (const pr of validPRs) {
    const key = pr.difficulty ?? "unspecified";
    counts[key] = (counts[key] ?? 0) + 1;
    points[key] = (points[key] ?? 0) + pr.points;
  }

  const pieData = Object.entries(counts).map(([key, value]) => ({
    name: DIFF_LABELS[key] ?? key,
    value,
    key,
  }));

  const barData = Object.entries(points)
    .map(([key, pts]) => ({ name: DIFF_LABELS[key] ?? key, pts, key }))
    .sort((a, b) => b.pts - a.pts);

  if (!validPRs.length) {
    return (
      <div style={{
        background: ds.canvas, border: `1px solid ${ds.hairlineCool}`,
        borderRadius: ds.rLg, padding: 20,
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: 180,
      }}>
        <p style={{ color: ds.inkFaint, fontSize: 13 }}>No valid PRs yet</p>
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
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: ds.ink }}>Difficulty Distribution</p>
        <span style={{ fontSize: 11, color: ds.inkFaint }}>PR count · pts by level</span>
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>

        {/* Pie — no Legend inside */}
        <div>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={76}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry) => (
                  <Cell key={entry.key} fill={DIFF_COLORS[entry.key] ?? "#aaa"} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: ds.canvas, border: `1px solid ${ds.hairline}`, borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [`${v} PR${Number(v) !== 1 ? "s" : ""}`, ""]}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Custom legend below the pie */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: "6px 12px",
            marginTop: 12, paddingTop: 12,
            borderTop: `1px solid ${ds.hairlineCool}`,
            justifyContent: "center",
          }}>
            {pieData.map((entry) => (
              <div key={entry.key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                  background: DIFF_COLORS[entry.key] ?? "#aaa",
                }} />
                <span style={{ fontSize: 11, color: ds.inkMute }}>
                  {entry.name}
                </span>
                <span style={{ fontSize: 11, color: ds.inkFaint, fontWeight: 600 }}>
                  ×{entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart */}
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} layout="vertical" margin={{ left: -10, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={ds.hairlineCool} horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: ds.inkMute2 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: ds.inkMute }} axisLine={false} tickLine={false} width={82} />
            <Tooltip
              contentStyle={{ background: ds.canvas, border: `1px solid ${ds.hairline}`, borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [`${v} pts`, "Points"]}
            />
            <Bar dataKey="pts" radius={[0, 4, 4, 0]} barSize={22}>
              {barData.map((entry) => (
                <Cell key={entry.key} fill={DIFF_COLORS[entry.key] ?? "#aaa"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
