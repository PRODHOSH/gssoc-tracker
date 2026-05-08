"use client";
import { HistoryEntry, NotificationLog } from "@/types";
import { ds, fontMono } from "@/lib/ds";
import { TrendingUp, TrendingDown, Minus, Mail, MailCheck } from "lucide-react";

interface ActivityFeedProps {
  history: HistoryEntry[];
  notifications: NotificationLog[];
}

export function ActivityFeed({ history, notifications }: ActivityFeedProps) {
  /* Merge and sort events, show latest 20 */
  type Event =
    | { kind: "snapshot"; entry: HistoryEntry; ts: Date }
    | { kind: "notification"; log: NotificationLog; ts: Date };

  const events: Event[] = [
    ...history.map(e => ({ kind: "snapshot" as const, entry: e, ts: new Date(e.timestamp) })),
    ...notifications.map(n => ({ kind: "notification" as const, log: n, ts: new Date(n.timestamp) })),
  ].sort((a, b) => b.ts.getTime() - a.ts.getTime()).slice(0, 20);

  if (events.length === 0) {
    return (
      <Section title="Activity Feed">
        <div style={{ padding: "32px 0", textAlign: "center", color: ds.inkFaint, fontSize: 13 }}>
          No activity yet — waiting for first sync
        </div>
      </Section>
    );
  }

  return (
    <Section title="Activity Feed" subtitle={`${events.length} recent events`}>
      <div>
        {events.map((ev, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 12,
              padding: "10px 0",
              borderBottom: i < events.length - 1 ? `1px solid ${ds.hairlineCool}` : "none",
            }}
          >
            {/* Icon */}
            <div style={{ paddingTop: 2, flexShrink: 0 }}>
              {ev.kind === "snapshot" ? (
                <SnapshotIcon entry={ev.entry} />
              ) : (
                <span style={{ color: ds.inkMute2 }}>
                  {ev.log.email_sent ? <MailCheck size={14} /> : <Mail size={14} />}
                </span>
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {ev.kind === "snapshot" ? (
                <SnapshotRow entry={ev.entry} />
              ) : (
                <NotifRow log={ev.log} />
              )}
              <p style={{ margin: "3px 0 0", fontSize: 11, color: ds.inkFaint }}>
                {ev.ts.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function SnapshotIcon({ entry: e }: { entry: HistoryEntry }) {
  if (e.score_change > 0 || e.rank_change < 0) {
    return <TrendingUp size={14} color={ds.primaryDeep} />;
  }
  if (e.score_change < 0 || e.rank_change > 0) {
    return <TrendingDown size={14} color="#dc2626" />;
  }
  return <Minus size={14} color={ds.inkFaint} />;
}

function SnapshotRow({ entry: e }: { entry: HistoryEntry }) {
  const noChange = e.score_change === 0 && e.rank_change === 0;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 10px", alignItems: "baseline" }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: ds.ink, fontFamily: fontMono }}>
        {e.score.toLocaleString()} pts
      </span>
      <span style={{ fontSize: 12, color: ds.inkMute }}>Rank #{e.rank}</span>
      {!noChange && (
        <>
          {e.score_change !== 0 && (
            <span style={{ fontSize: 11, color: e.score_change > 0 ? ds.primaryDeep : "#dc2626", fontFamily: fontMono }}>
              {e.score_change > 0 ? "+" : ""}{e.score_change} pts
            </span>
          )}
          {e.rank_change !== 0 && (
            <span style={{ fontSize: 11, color: e.rank_change < 0 ? ds.primaryDeep : "#dc2626" }}>
              {e.rank_change < 0 ? `↑ ${Math.abs(e.rank_change)} rank` : `↓ ${e.rank_change} rank`}
            </span>
          )}
        </>
      )}
      {noChange && <span style={{ fontSize: 11, color: ds.inkFaint }}>No change</span>}
    </div>
  );
}

function NotifRow({ log }: { log: NotificationLog }) {
  return (
    <div>
      <span style={{ fontSize: 13, color: ds.ink }}>
        {log.type === "daily_digest" ? "Daily digest" : "Change alert"} email
        {" "}{log.email_sent ? <span style={{ color: ds.primaryDeep, fontSize: 11 }}>✓ sent</span> : <span style={{ color: ds.inkFaint, fontSize: 11 }}>not sent</span>}
      </span>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: ds.canvas,
      border: `1px solid ${ds.hairlineCool}`,
      borderRadius: ds.rLg,
      padding: 20,
      boxShadow: "0 1px 3px rgba(23,23,23,0.04)",
    }}>
      <div style={{ marginBottom: 14 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: ds.ink }}>{title}</p>
        {subtitle && <p style={{ margin: "2px 0 0", fontSize: 12, color: ds.inkMute2 }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
