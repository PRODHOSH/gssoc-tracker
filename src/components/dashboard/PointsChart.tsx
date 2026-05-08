"use client";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { HistoryEntry } from "@/types";
import { ds, fontMono } from "@/lib/ds";

interface PointsChartProps {
  history: HistoryEntry[];
  currentScore: number;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: HistoryEntry }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: ds.canvasNight, border: "1px solid rgba(255,255,255,0.1)", borderRadius: ds.rMd, padding: "10px 14px" }}>
      <p style={{ margin: 0, color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 4 }}>
        {new Date(d.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
      </p>
      <p style={{ margin: 0, color: ds.primary, fontFamily: fontMono, fontWeight: 700, fontSize: 16 }}>
        {d.score.toLocaleString()} pts
      </p>
      {d.score_change !== 0 && (
        <p style={{ margin: "3px 0 0", fontSize: 12, color: d.score_change > 0 ? ds.primary : "#f87171", fontFamily: fontMono }}>
          {d.score_change > 0 ? "+" : ""}{d.score_change}
        </p>
      )}
    </div>
  );
}

export function PointsChart({ history, currentScore }: PointsChartProps) {
  const shell = (children: React.ReactNode, subtitle?: string) => (
    <ChartShell title="Score History" subtitle={subtitle ?? `Current: ${currentScore.toLocaleString()} pts`}>
      {children}
    </ChartShell>
  );

  if (history.length === 0) {
    return shell(
      <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: ds.inkFaint, fontSize: 13 }}>
        No data yet — click Sync now
      </div>
    );
  }

  // Pad to ≥2 points so recharts draws a line
  const padded = history.length === 1
    ? [{ ...history[0], timestamp: history[0].timestamp }, { ...history[0] }]
    : history;

  const data  = padded.map(h => ({ ...h, date: fmt(h.timestamp) }));
  const min   = Math.min(...history.map(h => h.score));
  const max   = Math.max(...history.map(h => h.score));
  const range = max - min;

  return shell(
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
        <CartesianGrid stroke={ds.hairlineCool} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: ds.inkMute2 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[Math.max(0, min - (range || 50)), max + (range || 50)]}
          tick={{ fontSize: 11, fill: ds.inkMute2, fontFamily: fontMono }}
          tickLine={false}
          axisLine={false}
          tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="score"
          stroke={ds.primary}
          strokeWidth={2.5}
          dot={history.length <= 3 ? { r: 4, fill: ds.primary, strokeWidth: 0 } : false}
          activeDot={{ r: 5, fill: ds.primary, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>,
    history.length === 1 ? "Sync again to see trends develop" : `${history.length} data points · Current: ${currentScore.toLocaleString()} pts`
  );
}

function ChartShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: ds.canvas,
      border: `1px solid ${ds.hairlineCool}`,
      borderRadius: ds.rLg,
      padding: 20,
      boxShadow: "0 1px 3px rgba(23,23,23,0.04)",
    }}>
      <div style={{ marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: ds.ink }}>{title}</p>
        {subtitle && <p style={{ margin: "2px 0 0", fontSize: 12, color: ds.inkMute2 }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
