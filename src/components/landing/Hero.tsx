"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { GitHubIcon } from "@/components/icons";
import { ds, fontMono } from "@/lib/ds";

const EXAMPLES = ["PRODHOSH", "ArokyaMatthew", "mdnm18"];

/* ── Mini dashboard mockup ─────────────────────────────────── */
function DashboardMockup() {
  return (
    <div style={{
      background: ds.canvasNight,
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 32px 80px rgba(0,0,0,0.45)",
      width: "100%",
      maxWidth: 420,
    }}>
      {/* Window chrome */}
      <div style={{
        background: "#141414",
        padding: "10px 14px",
        display: "flex", alignItems: "center", gap: 6,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        {["#ff5f57","#ffbd2e","#28c840"].map((c,i) => (
          <span key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: c, display: "inline-block" }} />
        ))}
        <span style={{
          flex: 1, textAlign: "center",
          fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: fontMono,
        }}>
          gssoc-tracker · @PRODHOSH
        </span>
      </div>

      {/* Profile row */}
      <div style={{
        padding: "16px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <img src="https://avatars.githubusercontent.com/PRODHOSH"
          alt="PRODHOSH" width={38} height={38}
          style={{ borderRadius: "50%", border: "2px solid rgba(62,207,142,0.35)" }} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>Prodhosh VS</p>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: fontMono }}>@PRODHOSH · VIT Chennai</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Rank</p>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: fontMono }}>#10</p>
        </div>
      </div>

      {/* Score */}
      <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Total Score</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: ds.primary, fontFamily: fontMono }}>1,020 pts</span>
        </div>
        {/* Score bars */}
        {[
          { role: "Ambassador",  pts: 935, pct: 91.7, color: "#a78bfa" },
          { role: "Contributor", pts: 110, pct: 10.8, color: ds.primary },
        ].map(r => (
          <div key={r.role} style={{ marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{r.role}</span>
              <span style={{ fontSize: 11, fontFamily: fontMono, color: r.color }}>{r.pts}</span>
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}>
              <div style={{ width: `${r.pct}%`, height: "100%", background: r.color, borderRadius: 99 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Change indicator */}
      <div style={{ padding: "10px 18px", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: "2px 8px",
          borderRadius: 99, background: "rgba(62,207,142,0.1)",
          color: ds.primary, border: "1px solid rgba(62,207,142,0.2)",
        }}>
          ↑ +30 pts
        </span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>since last sync · updated 6h ago</span>
      </div>
    </div>
  );
}

/* ── Hero ──────────────────────────────────────────────────── */
export function Hero() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [state, setState]       = useState<"idle" | "checking" | "error">("idle");
  const [errMsg, setErrMsg]     = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    const u = username.trim().replace(/^@/, "");
    if (!u) return;
    setState("checking");
    try {
      const res  = await fetch(`/api/lookup?username=${encodeURIComponent(u)}`);
      const data = await res.json() as { error?: string };
      if (!res.ok) { setErrMsg(data.error ?? "Not found"); setState("error"); return; }
      router.push(`/dashboard/${encodeURIComponent(u)}`);
    } catch {
      setErrMsg("Couldn't reach the API. Please try again.");
      setState("error");
    }
  }

  return (
    <section id="hero" style={{ background: ds.canvasNight, padding: "80px 24px 96px", overflow: "hidden" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 64, flexWrap: "wrap" }}>

        {/* Left — text */}
        <div style={{ flex: "1 1 380px", minWidth: 0 }}>
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "4px 12px", borderRadius: 99,
              background: "rgba(62,207,142,0.08)",
              border: "1px solid rgba(62,207,142,0.2)",
              marginBottom: 28,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: ds.primary, display: "inline-block" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: ds.primary, letterSpacing: "0.03em" }}>
                GSSoC 2026 · Live Leaderboard Tracker
              </span>
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, duration: 0.4 }}
            style={{
              margin: "0 0 20px",
              fontSize: "clamp(36px, 5vw, 54px)",
              fontWeight: 700, lineHeight: 1.1,
              color: ds.onDark, letterSpacing: "-0.03em",
            }}>
            Track your GSSoC<br />
            <span style={{ color: ds.primary }}>progress</span> in real time
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.14 }}
            style={{ margin: "0 0 36px", fontSize: 17, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, maxWidth: 440 }}>
            Personal analytics dashboard for any GSSoC 2026 participant.
            Score breakdown, rank history, and automatic email alerts — all in one place.
          </motion.p>

          {/* Search */}
          <motion.form onSubmit={submit} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: "flex", gap: 8, maxWidth: 420 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <GitHubIcon width={14} height={14} style={{
                position: "absolute", left: 12, top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(255,255,255,0.3)", pointerEvents: "none",
              }} />
              <input
                type="text" value={username}
                onChange={e => { setUsername(e.target.value); setState("idle"); setErrMsg(""); }}
                placeholder="Enter GitHub username…"
                style={{
                  width: "100%", height: 46,
                  padding: "0 14px 0 36px",
                  borderRadius: 8,
                  border: `1px solid ${state === "error" ? "rgba(248,113,113,0.6)" : "rgba(255,255,255,0.1)"}`,
                  background: "rgba(255,255,255,0.05)",
                  color: ds.onDark, fontSize: 14, outline: "none",
                  fontFamily: "var(--font-sans)",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(62,207,142,0.5)")}
                onBlur={e  => (e.currentTarget.style.borderColor = state === "error" ? "rgba(248,113,113,0.6)" : "rgba(255,255,255,0.1)")}
              />
            </div>
            <button type="submit" disabled={state === "checking" || !username.trim()}
              style={{
                height: 46, padding: "0 20px", borderRadius: 8, border: "none",
                background: state === "checking" ? "rgba(62,207,142,0.6)" : ds.primary,
                color: ds.onPrimary, fontSize: 14, fontWeight: 600,
                cursor: state === "checking" ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
                transition: "background 0.13s",
              }}>
              {state === "checking"
                ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Checking…</>
                : <>View dashboard <ArrowRight size={14} /></>}
            </button>
          </motion.form>

          {state === "error" && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 13, color: "#f87171" }}>
              <AlertCircle size={13} /> {errMsg}
            </div>
          )}

          {/* Examples */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>Try:</span>
            {EXAMPLES.map(u => (
              <button key={u} onClick={() => { setUsername(u); setState("idle"); setErrMsg(""); }}
                style={{
                  padding: "3px 10px", borderRadius: 99,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.4)", fontSize: 12,
                  cursor: "pointer", fontFamily: fontMono,
                  transition: "all 0.12s",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
              >
                @{u}
              </button>
            ))}
          </div>
        </div>

        {/* Right — dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          style={{ flex: "1 1 360px", display: "flex", justifyContent: "center" }}
        >
          <DashboardMockup />
        </motion.div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  );
}
