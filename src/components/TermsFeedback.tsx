"use client";
import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { ds } from "@/lib/ds";

const K_DONE = "gssoc_nps_done";

const RATINGS = [
  { score: 1, emoji: "😞", label: "Not useful"   },
  { score: 2, emoji: "😕", label: "Needs work"   },
  { score: 3, emoji: "😐", label: "It's okay"    },
  { score: 4, emoji: "🙂", label: "Pretty good!" },
  { score: 5, emoji: "😍", label: "Love it!"     },
];

export function TermsFeedback() {
  const [ready, setReady]     = useState(false);
  const [done, setDone]       = useState(false);
  const [score, setScore]     = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [phase, setPhase]     = useState<"idle" | "loading" | "submitted">("idle");
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    setDone(!!localStorage.getItem(K_DONE));
    setReady(true);
  }, []);

  async function submit() {
    if (!score) return;
    setPhase("loading");
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, comment: comment.trim() }),
      });
    } catch {}
    localStorage.setItem(K_DONE, "1");
    setPhase("submitted");
  }

  if (!ready || done) return null;

  return (
    <div style={{ marginBottom: 40 }}>
      {/* Header — matches Section style in terms page */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "rgba(62,207,142,0.1)",
          border: "1px solid rgba(62,207,142,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <MessageSquare size={15} color={ds.primary} />
        </div>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
          How useful is this tool for you?
        </h2>
      </div>

      <div style={{ paddingLeft: 42 }}>
        {phase === "submitted" ? (
          <div style={{
            padding: "20px",
            borderRadius: 10,
            background: "rgba(62,207,142,0.06)",
            border: "1px solid rgba(62,207,142,0.2)",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🙏</div>
            <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
              Thanks! Your feedback genuinely helps improve this.
            </p>
          </div>
        ) : (
          <>
            <p style={{ margin: "0 0 16px", fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>
              Takes 10 seconds. No sign-up, just pick an emoji and optionally tell us what could be better.
            </p>

            {/* Emoji rating */}
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              {RATINGS.map((r) => {
                const sel = score === r.score;
                const hov = hovered === r.score;
                return (
                  <button
                    key={r.score}
                    onClick={() => setScore(r.score)}
                    onMouseEnter={() => setHovered(r.score)}
                    onMouseLeave={() => setHovered(null)}
                    title={r.label}
                    style={{
                      flex: 1, padding: "10px 2px", borderRadius: 8,
                      border: `1.5px solid ${sel ? ds.primary : hov ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}`,
                      background: sel ? "rgba(62,207,142,0.1)" : hov ? "rgba(255,255,255,0.04)" : "transparent",
                      cursor: "pointer", fontSize: 24, lineHeight: 1,
                      transition: "all 0.12s",
                      transform: sel || hov ? "scale(1.1)" : "scale(1)",
                    }}
                  >
                    {r.emoji}
                  </button>
                );
              })}
            </div>

            <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 600, color: ds.primaryDeep, minHeight: 16, textAlign: "center" }}>
              {score ? RATINGS.find((r) => r.score === score)?.label : ""}
            </p>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Any suggestions? (optional)"
              rows={2}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                fontSize: 13, color: "rgba(255,255,255,0.65)",
                resize: "none", outline: "none",
                fontFamily: "var(--font-sans)", lineHeight: 1.6,
                boxSizing: "border-box",
                transition: "border-color 0.13s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(62,207,142,0.45)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />

            <button
              onClick={submit}
              disabled={!score || phase === "loading"}
              style={{
                marginTop: 10, width: "100%", padding: "11px",
                borderRadius: 6, border: "none",
                background: score ? ds.primary : "rgba(255,255,255,0.07)",
                color: score ? ds.onPrimary : "rgba(255,255,255,0.2)",
                fontSize: 13, fontWeight: 600,
                cursor: score ? "pointer" : "not-allowed",
                transition: "all 0.13s",
              }}
            >
              {phase === "loading" ? "Sending..." : "Submit feedback"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
