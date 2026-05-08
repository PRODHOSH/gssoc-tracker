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

interface RankChartProps {
  history: HistoryEntry[];
  currentRank: number;
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
      <p style={{ margin: 0, color: ds.onDark, fontFamily: fontMono, fontWeight: 700, fontSize: 16 }}>
        Rank #{d.rank}
      </p>
      {d.rank_change !== 0 && (
        <p style={{ margin: "3px 0 0", fontSize: 12, color: d.rank_change < 0 ? ds.primary : "#f87171" }}>
          {d.rank_change < 0 ? `↑ ${Math.abs(d.rank_change)} places` : `↓ ${d.rank_change} places`}
        </p>
      )}
    </div>
  );
}

export function RankChart({ history, currentRank }: RankChartProps) {
  const noData = history.length === 0;
  const onePoint = history.length === 1;

  const padded = onePoint
    ? [{ ...history[0] }, { ...history[0] }]
    : history;

  const data   = padded.map(h => ({ ...h, date: fmt(h.timestamp) }));
  const ranks  = history.map(h => h.rank);
  const best   = ranks.length ? Math.min(...ranks) : currentRank;
  const worst  = ranks.length ? Math.max(...ranks) : currentRank;
  const pad    = Math.max(5, Math.floor((worst - best) * 0.2));

  return (
    <div style={{
      background: ds.canvas,
      border: `1px solid ${ds.hairlineCool}`,
      borderRadius: ds.rLg,
      padding: 20,
      boxShadow: "0 1px 3px rgba(23,23,23,0.04)",
    }}>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: ds.ink }}>Rank History</p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: ds.inkMute2 }}>
            {noData ? "No data yet" : onePoint ? "Sync again to see trend" : `Current: #${currentRank} · Best: #${best}`}
          </p>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: "2px 8px",
          borderRadius: ds.rFull,
          background: "rgba(62,207,142,0.08)",
          color: ds.primaryDeep,
          border: `1px solid rgba(62,207,142,0.2)`,
        }}>
          Lower rank = better ↓
        </span>
      </div>

      {noData ? (
        <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: ds.inkFaint, fontSize: 13 }}>
          No data yet — click Sync now
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
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
              domain={[Math.max(1, best - pad), worst + pad]}
              reversed
              tick={{ fontSize: 11, fill: ds.inkMute2, fontFamily: fontMono }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `#${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="rank"
              stroke="#ca8a04"
              strokeWidth={2.5}
              dot={history.length <= 3 ? { r: 4, fill: "#ca8a04", strokeWidth: 0 } : false}
              activeDot={{ r: 5, fill: "#ca8a04", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
