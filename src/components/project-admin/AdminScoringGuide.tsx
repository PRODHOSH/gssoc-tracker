import { HelpCircle } from "lucide-react";
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
          Project Admin Scoring Guide
        </h4>
      </div>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: ds.inkMute, lineHeight: 1.5 }}>
        Ongoing project admin points are calculated dynamically based on GitHub events in registered GSSoC repos.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: ds.inkMute2, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
            Ongoing Actions
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
          <p style={{ margin: "8px 0 0", fontSize: 11, color: ds.inkFaint, lineHeight: 1.4 }}>
            * Note: One-time Base Application Form points are not included as they cannot be parsed from GitHub API.
            <br />
            * Note: Labeled issue points are calculated at the repository level due to GitHub API rate limits.
          </p>
        </div>
      </div>
    </div>
  );
}
