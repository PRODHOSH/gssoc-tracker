"use client";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { ds } from "@/lib/ds";

/* ── Shared PR data shape ────────────────────────────────────── */

export interface AnalyticsPR {
  levelKey: string | null;
  qualityKey: string | null;
  typeKeys: string[];
}

/* ── Colour maps ─────────────────────────────────────────────── */

const LEVEL_COLORS: Record<string, string> = {
  "level:beginner":     "#10b981",
  "level:intermediate": "#f59e0b",
  "level:advanced":     "#8b5cf6",
  "level:critical":     "#ef4444",
};
const LEVEL_LABELS: Record<string, string> = {
  "level:beginner": "Beginner", "level:intermediate": "Intermediate",
  "level:advanced": "Advanced", "level:critical": "Critical",
};

const QUALITY_COLORS: Record<string, string> = {
  "quality:exceptional": "#ca8a04",
  "quality:clean":       "#10b981",
  "none":                "#e5e7eb",
};
const QUALITY_LABELS: Record<string, string> = {
  "quality:exceptional": "Exceptional", "quality:clean": "Clean", "none": "No label",
};

const TYPE_COLORS: Record<string, string> = {
  "type:feature":       "#3ecf8e",
  "type:bug":           "#ef4444",
  "type:docs":          "#818cf8",
  "type:testing":       "#f59e0b",
  "type:refactor":      "#06b6d4",
  "type:design":        "#ec4899",
  "type:performance":   "#8b5cf6",
  "type:security":      "#f97316",
  "type:accessibility": "#84cc16",
  "type:devops":        "#64748b",
};

/* ── Primitives ──────────────────────────────────────────────── */

function Empty({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 140 }}>
      <p style={{ color: ds.inkFaint, fontSize: 13 }}>{label}</p>
    </div>
  );
}

function Legend({ items }: { items: { key: string; label: string; color: string; count: number }[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", justifyContent: "center", paddingTop: 12, borderTop: `1px solid ${ds.hairlineCool}` }}>
      {items.map((item) => (
        <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: ds.inkMute }}>{item.label}</span>
          <span style={{ fontSize: 11, color: ds.inkFaint, fontWeight: 600 }}>×{item.count}</span>
        </div>
      ))}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: ds.canvas, border: `1px solid ${ds.hairlineCool}`, borderRadius: ds.rLg, padding: "16px 18px", boxShadow: "0 1px 4px rgba(23,23,23,0.04)" }}>
      <p style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: ds.ink }}>{title}</p>
      {children}
    </div>
  );
}

/* ── Level chart ─────────────────────────────────────────────── */

function LevelChart({ prs }: { prs: AnalyticsPR[] }) {
  const counts: Record<string, number> = {};
  for (const pr of prs) {
    const k = pr.levelKey ?? "level:beginner";
    counts[k] = (counts[k] ?? 0) + 1;
  }
  const ORDER = ["level:beginner", "level:intermediate", "level:advanced", "level:critical"];
  const data = Object.entries(counts)
    .sort((a, b) => ORDER.indexOf(a[0]) - ORDER.indexOf(b[0]))
    .map(([key, value]) => ({ key, name: LEVEL_LABELS[key] ?? key, value }));

  if (!data.length) return <Empty label="No level data" />;
  return (
    <>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={44} outerRadius={70} paddingAngle={3} dataKey="value">
            {data.map((e) => <Cell key={e.key} fill={LEVEL_COLORS[e.key] ?? "#aaa"} />)}
          </Pie>
          <Tooltip contentStyle={{ background: ds.canvas, border: `1px solid ${ds.hairline}`, borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v} PR${Number(v) !== 1 ? "s" : ""}`, ""]} />
        </PieChart>
      </ResponsiveContainer>
      <Legend items={data.map((d) => ({ key: d.key, label: d.name, color: LEVEL_COLORS[d.key] ?? "#aaa", count: d.value }))} />
    </>
  );
}

/* ── Quality chart ───────────────────────────────────────────── */

function QualityChart({ prs }: { prs: AnalyticsPR[] }) {
  const counts: Record<string, number> = { "quality:exceptional": 0, "quality:clean": 0, "none": 0 };
  for (const pr of prs) {
    const k = pr.qualityKey ?? "none";
    counts[k] = (counts[k] ?? 0) + 1;
  }
  const data = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ key, name: QUALITY_LABELS[key] ?? key, value }));

  if (!data.length) return <Empty label="No quality data" />;
  return (
    <>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={44} outerRadius={70} paddingAngle={3} dataKey="value">
            {data.map((e) => <Cell key={e.key} fill={QUALITY_COLORS[e.key] ?? "#aaa"} />)}
          </Pie>
          <Tooltip contentStyle={{ background: ds.canvas, border: `1px solid ${ds.hairline}`, borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v} PR${Number(v) !== 1 ? "s" : ""}`, ""]} />
        </PieChart>
      </ResponsiveContainer>
      <Legend items={data.map((d) => ({ key: d.key, label: d.name, color: QUALITY_COLORS[d.key] ?? "#aaa", count: d.value }))} />
    </>
  );
}

/* ── Type chart ──────────────────────────────────────────────── */

function TypeChart({ prs }: { prs: AnalyticsPR[] }) {
  const counts: Record<string, number> = {};
  for (const pr of prs) {
    for (const k of pr.typeKeys) {
      counts[k] = (counts[k] ?? 0) + 1;
    }
  }
  const data = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ key, name: key.replace("type:", ""), count }));

  if (!data.length) return <Empty label="No type labels on these PRs" />;
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 34 + 24)}>
      <BarChart data={data} layout="vertical" margin={{ left: -4, right: 16, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={ds.hairlineCool} horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: ds.inkMute2 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: ds.inkMute }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: ds.canvas, border: `1px solid ${ds.hairline}`, borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v} PR${Number(v) !== 1 ? "s" : ""}`, ""]} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
          {data.map((e) => <Cell key={e.key} fill={TYPE_COLORS[e.key] ?? ds.primaryDeep} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ── Public export ───────────────────────────────────────────── */

export function AnalyticsCharts({ prs }: { prs: AnalyticsPR[] }) {
  if (!prs.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        <ChartCard title="Level Distribution"><LevelChart prs={prs} /></ChartCard>
        <ChartCard title="Quality Distribution"><QualityChart prs={prs} /></ChartCard>
      </div>
      <ChartCard title="PR Type Breakdown"><TypeChart prs={prs} /></ChartCard>
    </div>
  );
}
