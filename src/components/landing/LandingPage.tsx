"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ArrowRight, Loader2, AlertCircle, TrendingUp, Bell, BarChart3 } from "lucide-react";
import { GitHubIcon } from "@/components/icons";
import { ds, fontMono } from "@/lib/ds";

const FEATURES = [
  {
    icon: <BarChart3 size={18} />,
    title: "Score Analytics",
    desc: "Track your total score, per-role breakdown, and visualise points over time with interactive charts.",
  },
  {
    icon: <TrendingUp size={18} />,
    title: "Rank Tracking",
    desc: "Watch your global rank change across syncs. Spot when you climb or drop positions.",
  },
  {
    icon: <Bell size={18} />,
    title: "Email Alerts",
    desc: "Automatic change alerts and daily digest emails via GitHub Actions — never miss an update.",
  },
];

const EXAMPLE_USERS = ["PRODHOSH", "ArokyaMatthew", "mdnm18", "Nagajyothi-tammisetti"];

export function LandingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [state, setState]       = useState<"idle" | "checking" | "error">("idle");
  const [errMsg, setErrMsg]     = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const u = username.trim().replace(/^@/, "");
    if (!u) return;

    setState("checking");
    setErrMsg("");

    try {
      const res  = await fetch(`/api/lookup?username=${encodeURIComponent(u)}`);
      const data = await res.json() as { profile?: { name: string }; error?: string };
      if (!res.ok) {
        setErrMsg(data.error ?? "Not found");
        setState("error");
        return;
      }
      router.push(`/dashboard/${encodeURIComponent(u)}`);
    } catch {
      setErrMsg("Couldn't reach the GSSoC API. Please try again.");
      setState("error");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: ds.canvasSoft, fontFamily: "var(--font-sans)" }}>

      {/* ── Hero (dark) ──────────────────────────────── */}
      <div style={{ background: ds.canvasNight }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "72px 24px 64px", textAlign: "center" }}>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 12px",
              borderRadius: ds.rFull,
              fontSize: ds.fsMicro,
              fontWeight: 600,
              background: "rgba(62,207,142,0.1)",
              color: ds.primary,
              border: "1px solid rgba(62,207,142,0.22)",
              marginBottom: 24,
              letterSpacing: "0.03em",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: ds.primary, display: "inline-block" }} />
              GSSoC 2026 · Progress Tracker
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.06 }}
            style={{
              margin: "0 0 16px",
              fontSize: "clamp(30px, 5vw, 48px)",
              fontWeight: 600,
              color: ds.onDark,
              letterSpacing: "-0.03em",
              lineHeight: 1.12,
            }}
          >
            Track your GSSoC{" "}
            <span style={{ color: ds.primary }}>progress</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            style={{ margin: "0 0 40px", fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}
          >
            Enter any GSSoC 2026 participant&apos;s GitHub username to see their live dashboard —
            score breakdown, rank, tracks, and more.
          </motion.p>

          {/* Search form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            style={{ display: "flex", gap: 8, maxWidth: 440, margin: "0 auto" }}
          >
            <div style={{ position: "relative", flex: 1 }}>
              <GitHubIcon
                width={15}
                height={15}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(255,255,255,0.3)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setState("idle"); setErrMsg(""); }}
                placeholder="GitHub username…"
                autoFocus
                style={{
                  width: "100%",
                  height: 44,
                  padding: "0 12px 0 36px",
                  borderRadius: ds.rMd,
                  border: `1px solid ${state === "error" ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.12)"}`,
                  background: "rgba(255,255,255,0.06)",
                  color: ds.onDark,
                  fontSize: 15,
                  outline: "none",
                  fontFamily: "var(--font-sans)",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = `rgba(62,207,142,0.5)`)}
                onBlur={e  => (e.currentTarget.style.borderColor = state === "error" ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.12)")}
              />
            </div>
            <button
              type="submit"
              disabled={state === "checking" || !username.trim()}
              style={{
                height: 44,
                padding: "0 20px",
                borderRadius: ds.rMd,
                border: "none",
                background: state === "checking" ? "rgba(62,207,142,0.6)" : ds.primary,
                color: ds.onPrimary,
                fontSize: 14,
                fontWeight: 600,
                cursor: state === "checking" ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 6,
                flexShrink: 0,
                transition: "background 0.13s",
              }}
            >
              {state === "checking" ? (
                <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <ArrowRight size={15} />
              )}
              {state === "checking" ? "Checking…" : "View"}
            </button>
          </motion.form>

          {/* Error message */}
          {state === "error" && errMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, fontSize: 13, color: "#f87171" }}
            >
              <AlertCircle size={14} />
              {errMsg}
            </motion.div>
          )}

          {/* Example usernames */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}
          >
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>Try:</span>
            {EXAMPLE_USERS.map(u => (
              <button
                key={u}
                onClick={() => { setUsername(u); setState("idle"); setErrMsg(""); }}
                style={{
                  padding: "2px 10px",
                  borderRadius: ds.rFull,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: fontMono,
                  transition: "all 0.12s",
                }}
              >
                @{u}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Features ────────────────────────────────── */}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.35 }}
              style={{
                background: ds.canvas,
                border: `1px solid ${ds.hairlineCool}`,
                borderRadius: ds.rLg,
                padding: 24,
                boxShadow: "0 1px 3px rgba(23,23,23,0.04)",
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: ds.rMd,
                background: "rgba(62,207,142,0.08)",
                border: "1px solid rgba(62,207,142,0.18)",
                color: ds.primaryDeep,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 14,
              }}>
                {f.icon}
              </div>
              <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: ds.ink }}>{f.title}</p>
              <p style={{ margin: 0, fontSize: 13, color: ds.inkMute, lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: 12, color: ds.inkFaint, marginTop: 40 }}>
          Community tool · Data from{" "}
          <a href="https://gssoc.girlscript.org" target="_blank" rel="noopener noreferrer" style={{ color: ds.inkMute2 }}>
            gssoc.girlscript.org
          </a>
          {" "}· Not affiliated with GirlScript Foundation
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
