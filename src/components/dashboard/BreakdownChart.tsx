"use client";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { ProfileSnapshot } from "@/types";
import { ds, fontMono } from "@/lib/ds";

interface BreakdownChartProps {
  profile: ProfileSnapshot;
}

const ROLE_COLORS: Record<string, string> = {
  ambassador:    "#7c3aed",
  contributor:   ds.primary,
  mentor:        "#ca8a04",
  "project-admin": "#2563eb",
  volunteer:     "#db2777",
  general:       ds.inkMute2,
};

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { value: number; name: string }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: ds.canvasNight,
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: ds.rMd,
      padding: "10px 14px",
      fontSize: 13,
    }}>
      <p style={{ margin: 0, color: ds.onDark, fontFamily: fontMono, fontWeight: 700 }}>
        {payload[0].value.toLocaleString()} pts
      </p>
      <p style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
        {payload[0].name}
      </p>
    </div>
  );
}

export function BreakdownChart({ profile: p }: BreakdownChartProps) {
  const data = Object.entries(p.role_scores)
    .sort(([, a], [, b]) => b - a)
    .map(([role, pts]) => ({
      role: role.charAt(0).toUpperCase() + role.slice(1),
      pts,
      color: ROLE_COLORS[role] ?? ds.inkMute,
    }));

  if (data.length === 0) {
    return (
      <div style={{
        background: ds.canvas,
        border: `1px solid ${ds.hairlineCool}`,
        borderRadius: ds.rLg,
        padding: 20,
      }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: ds.ink }}>Score Breakdown</p>
        <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: ds.inkFaint }}>
          No role data
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: ds.canvas,
      border: `1px solid ${ds.hairlineCool}`,
      borderRadius: ds.rLg,
      padding: 20,
      boxShadow: "0 1px 3px rgba(23,23,23,0.04)",
    }}>
      <div style={{ marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: ds.ink }}>Score Breakdown by Role</p>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: ds.inkMute2 }}>
          Total: {p.score.toLocaleString()} pts
        </p>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
          <CartesianGrid stroke={ds.hairlineCool} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="role"
            tick={{ fontSize: 11, fill: ds.inkMute2 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: ds.inkMute2, fontFamily: fontMono }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(23,23,23,0.03)" }} />
          <Bar dataKey="pts" name="Score" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
        {data.map(d => (
          <div key={d.role} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, display: "inline-block" }} />
            <span style={{ fontSize: 11, color: ds.inkMute2 }}>{d.role}</span>
            <span style={{ fontSize: 11, fontFamily: fontMono, fontWeight: 600, color: ds.ink }}>{d.pts.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
