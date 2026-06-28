"use client";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from "recharts";
import type { TrackedPR } from "@/types/pr-tracker";
import { ScrollSlideIn } from "@/components/animations/ScrollSlideIn";

const LEVEL_COLORS: Record<string, string> = {
  "level:beginner":     "#059669",
  "level:intermediate": "#10b981",
  "level:advanced":     "#6ee7b7",
  "level:critical":     "#064e3b",
};
const LEVEL_LABELS: Record<string, string> = {
  "level:beginner": "Beginner", "level:intermediate": "Intermediate",
  "level:advanced": "Advanced", "level:critical": "Critical",
};

const QUALITY_COLORS: Record<string, string> = {
  "quality:exceptional": "#10b981",
  "quality:clean":       "#E4E4E7",
  "none":                "#27272a",
};
const QUALITY_LABELS: Record<string, string> = {
  "quality:exceptional": "Exceptional", "quality:clean": "Clean", "none": "No label",
};

const TYPE_COLORS: Record<string, string> = {
  "type:feature":       "#059669",
  "type:bug":           "#10b981",
  "type:docs":          "#6ee7b7",
  "type:testing":       "#E4E4E7",
  "type:refactor":      "#a1a1aa",
  "type:design":        "#71717a",
  "type:performance":   "#52525b",
  "type:security":      "#3f3f46",
  "type:accessibility": "#27272a",
  "type:devops":        "#18181b",
};

function Empty({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center min-h-[140px]">
      <p className="text-muted-steel text-sm font-sans">{label}</p>
    </div>
  );
}

function Legend({ items }: { items: { key: string; label: string; color: string; count: number }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center pt-4 border-t border-whisper-border">
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
          <span className="text-xs text-muted-steel font-sans">{item.label}</span>
          <span className="text-xs font-mono font-bold text-ghost-white">×{item.count}</span>
        </div>
      ))}
    </div>
  );
}

function ChartCard({ title, children, metric }: { title: string; children: React.ReactNode, metric?: string }) {
  return (
    <div className="bg-pure-surface border border-whisper-border rounded-xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-display text-xl font-bold text-ghost-white">{title}</h3>
        {metric && <span className="font-mono text-[11px] font-bold text-muted-steel uppercase tracking-widest">{metric}</span>}
      </div>
      {children}
    </div>
  );
}

function LevelChart({ prs }: { prs: TrackedPR[] }) {
  const counts: Record<string, number> = {};
  for (const pr of prs) {
    const k = pr.difficulty ?? "level:beginner";
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
          <Pie data={data} cx="50%" cy="50%" innerRadius={44} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
            {data.map((e) => <Cell key={e.key} fill={LEVEL_COLORS[e.key] ?? "#aaa"} />)}
          </Pie>
          <Tooltip 
            contentStyle={{ background: "#18181B", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "12px", color: "#FAFAFA" }} 
            itemStyle={{ color: "#FAFAFA" }}
            formatter={(v) => [`${v} PR${Number(v) !== 1 ? "s" : ""}`, ""]} 
          />
        </PieChart>
      </ResponsiveContainer>
      <Legend items={data.map((d) => ({ key: d.key, label: d.name, color: LEVEL_COLORS[d.key] ?? "#aaa", count: d.value }))} />
    </>
  );
}

function QualityChart({ prs }: { prs: TrackedPR[] }) {
  const counts: Record<string, number> = { "quality:exceptional": 0, "quality:clean": 0, "none": 0 };
  for (const pr of prs) {
    const k = pr.quality ?? "none";
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
          <Pie data={data} cx="50%" cy="50%" innerRadius={44} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
            {data.map((e) => <Cell key={e.key} fill={QUALITY_COLORS[e.key] ?? "#aaa"} />)}
          </Pie>
          <Tooltip 
            contentStyle={{ background: "#18181B", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "12px", color: "#FAFAFA" }} 
            itemStyle={{ color: "#FAFAFA" }}
            formatter={(v) => [`${v} PR${Number(v) !== 1 ? "s" : ""}`, ""]} 
          />
        </PieChart>
      </ResponsiveContainer>
      <Legend items={data.map((d) => ({ key: d.key, label: d.name, color: QUALITY_COLORS[d.key] ?? "#aaa", count: d.value }))} />
    </>
  );
}

function TypeChart({ prs }: { prs: TrackedPR[] }) {
  const counts: Record<string, number> = {};
  for (const pr of prs) {
    for (const k of pr.typeBonuses) {
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
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#A1A1AA" }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: "#FAFAFA", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
        <Tooltip 
          contentStyle={{ background: "#18181B", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "12px", color: "#FAFAFA" }} 
          itemStyle={{ color: "#FAFAFA" }}
          formatter={(v) => [`${v} PR${Number(v) !== 1 ? "s" : ""}`, ""]} 
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
          {data.map((e) => <Cell key={e.key} fill={TYPE_COLORS[e.key] ?? "#10b981"} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function GrowthChart({ prs }: { prs: TrackedPR[] }) {
  if (!prs.length) return <Empty label="No data to show" />;

  // Sort PRs by date ascending
  const sorted = [...prs].sort((a, b) => {
    const da = a.mergedAt ? new Date(a.mergedAt).getTime() : new Date(a.createdAt).getTime();
    const db = b.mergedAt ? new Date(b.mergedAt).getTime() : new Date(b.createdAt).getTime();
    return da - db;
  });

  const data: { dateStr: string; timestamp: number; cumulativePoints: number; cumulativePRs: number }[] = [];
  let points = 0;
  let count = 0;

  for (const pr of sorted) {
    const t = pr.mergedAt ? new Date(pr.mergedAt) : new Date(pr.createdAt);
    points += pr.points;
    count += 1;
    data.push({
      dateStr: t.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
      timestamp: t.getTime(),
      cumulativePoints: points,
      cumulativePRs: count,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="text-xs font-mono font-bold text-muted-steel uppercase tracking-widest mb-4">Cumulative Points</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ left: -20, right: 16, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="dateStr" tick={{ fontSize: 11, fill: "#A1A1AA" }} axisLine={false} tickLine={false} minTickGap={30} />
            <YAxis tick={{ fontSize: 11, fill: "#A1A1AA" }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ background: "#18181B", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "12px", color: "#FAFAFA" }} 
              itemStyle={{ color: "#10b981", fontWeight: "bold" }}
              labelStyle={{ color: "#A1A1AA", marginBottom: "4px" }}
            />
            <Line type="stepAfter" dataKey="cumulativePoints" name="Points" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-6 border-t border-whisper-border">
        <h4 className="text-xs font-mono font-bold text-muted-steel uppercase tracking-widest mb-4">Cumulative PRs Merged</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ left: -20, right: 16, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="dateStr" tick={{ fontSize: 11, fill: "#A1A1AA" }} axisLine={false} tickLine={false} minTickGap={30} />
            <YAxis tick={{ fontSize: 11, fill: "#A1A1AA" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip 
              contentStyle={{ background: "#18181B", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "12px", color: "#FAFAFA" }} 
              itemStyle={{ color: "#6ee7b7", fontWeight: "bold" }}
              labelStyle={{ color: "#A1A1AA", marginBottom: "4px" }}
            />
            <Line type="stepAfter" dataKey="cumulativePRs" name="Total PRs" stroke="#6ee7b7" strokeWidth={2} dot={{ r: 3, fill: "#6ee7b7", strokeWidth: 0 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AnalyticsCharts({ prs }: { prs: TrackedPR[] }) {
  if (!prs.length) return null;
  return (
    <div className="flex flex-col gap-6 mb-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScrollSlideIn direction="right" className="flex flex-col gap-6">
          <ChartCard title="PRs by Difficulty" metric="SYSTEM_METRIC: LVL_DIST">
            <LevelChart prs={prs} />
          </ChartCard>
          <ChartCard title="Quality Distribution" metric="SYSTEM_METRIC: Q_DIST">
            <QualityChart prs={prs} />
          </ChartCard>
        </ScrollSlideIn>
        
        <ScrollSlideIn direction="left" className="flex flex-col gap-6">
          <ChartCard title="Contribution Growth" metric="SYSTEM_METRIC: GROWTH">
            <GrowthChart prs={prs} />
          </ChartCard>
        </ScrollSlideIn>
      </div>
      <ScrollSlideIn direction="right">
        <ChartCard title="PR Type Breakdown" metric="SYSTEM_METRIC: TYPE_DIST">
          <TypeChart prs={prs} />
        </ChartCard>
      </ScrollSlideIn>
    </div>
  );
}
