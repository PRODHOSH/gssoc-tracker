"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ds, fontMono } from "@/lib/ds";
import type { TrackedPR } from "@/types/pr-tracker";

interface Props {
  validPRs: TrackedPR[];
}

export function PointsTimeline({ validPRs }: Props) {
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

  // Cumulative points by merge date
  const sorted = [...validPRs]
    .filter((pr) => pr.mergedAt)
    .sort((a, b) => new Date(a.mergedAt!).getTime() - new Date(b.mergedAt!).getTime());

  let cumulative = 0;
  const chartData = sorted.map((pr) => {
    cumulative += pr.points;
    const d = new Date(pr.mergedAt!);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      points: cumulative,
      pr: pr.title.slice(0, 40) + (pr.title.length > 40 ? "…" : ""),
    };
  });

  return (
    <div style={{
      background: ds.canvas,
      border: `1px solid ${ds.hairlineCool}`,
      borderRadius: ds.rLg,
      padding: "18px 20px",
      boxShadow: "0 1px 4px rgba(23,23,23,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: ds.ink }}>Points Over Time</p>
        <span style={{ fontSize: 11, color: ds.inkFaint }}>cumulative</span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
          <defs>
            <linearGradient id="ptGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={ds.primary} stopOpacity={0.25} />
              <stop offset="95%" stopColor={ds.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={ds.hairlineCool} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: ds.inkMute2 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: ds.inkMute2, fontFamily: fontMono }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: ds.canvas,
              border: `1px solid ${ds.hairline}`,
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v) => [`${v} pts`, "Cumulative Points"]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="points"
            stroke={ds.primary}
            strokeWidth={2}
            fill="url(#ptGrad)"
            dot={{ r: 3, fill: ds.primary, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: ds.primaryDeep }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
