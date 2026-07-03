import { AlertTriangle, HelpCircle } from "lucide-react";
import { ds } from "@/lib/ds";

export function AdminScoringGuide() {
  return (
    <div style={{
      background: ds.canvas,
      border: `1px solid ${ds.hairlineCool}`,
      borderRadius: ds.rLg,
      padding: "20px 24px"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <HelpCircle size={16} color="#4f46e5" />
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: ds.ink }}>
          Points System
        </h4>
      </div>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: ds.inkMute, lineHeight: 1.5 }}>
        This tracker estimates project admin activity based on publicly available GitHub events.
      </p>

      {/* Disclaimer Banner */}
      <div style={{
        background: "rgba(245,158,11,0.07)",
        border: "1px solid rgba(245,158,11,0.3)",
        borderRadius: ds.rMd,
        padding: "10px 14px",
        marginBottom: 16,
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
      }}>
        <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ margin: 0, fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>
          <strong>Disclaimer:</strong> GSSoC&apos;s actual scoring may include additional factors (streaks, community bounty tasks, form-based data, etc.) that cannot be tracked via the GitHub API. Always refer to the official GSSoC leaderboard for final scores.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: ds.inkMute2, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
            Admin Scoring (Per Action)
          </span>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: ds.inkMute, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>Merge GSSoC contributor PR: <strong style={{ color: ds.ink }}>+15 pts</strong> per PR</li>
            <li>Label issue difficulty AND type: <strong style={{ color: ds.ink }}>+10 pts</strong></li>
            <li>Label issue difficulty only: <strong style={{ color: ds.ink }}>+5 pts</strong></li>
            <li>Open issue (beginner friendly): <strong style={{ color: ds.ink }}>+8 pts</strong></li>
            <li>Open issue (any other): <strong style={{ color: ds.ink }}>+3 pts</strong></li>
          </ul>
        </div>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: ds.inkMute2, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
            Issue Resolution Boost (Min 2 closed)
          </span>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: ds.inkMute, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>Average resolution time ≤ 2 days: <strong style={{ color: ds.ink }}>+60 pts</strong></li>
            <li>Average resolution time ≤ 5 days: <strong style={{ color: ds.ink }}>+40 pts</strong></li>
            <li>Average resolution time ≤ 10 days: <strong style={{ color: ds.ink }}>+20 pts</strong></li>
          </ul>
        </div>
      </div>

      {/* Contributor PR Formula (shown since PRs in the table use contributor scoring) */}
      <div style={{ marginTop: 20, borderTop: `1px solid ${ds.hairlineCool}`, paddingTop: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: ds.inkMute2, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
          Contributor PR Points (shown in table)
        </span>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: ds.inkMute, lineHeight: 1.5 }}>
          Each merged PR earns: <strong style={{ color: ds.ink }}>50 (base) + difficulty × quality + type bonus</strong>, capped at 175 pts.
          Only merged PRs with <code style={{ fontSize: 11, background: ds.canvasSoft, padding: "1px 5px", borderRadius: 4 }}>gssoc:approved</code> label earn points.
        </p>
      </div>
    </div>
  );
}
