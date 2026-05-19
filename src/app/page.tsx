"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, Star, GitPullRequest } from "lucide-react";
import { ds, fontMono } from "@/lib/ds";
import { GitHubIcon } from "@/components/icons";
import { SubscribeButton } from "@/components/SubscribeModal";
import { ScoringGuide } from "@/components/pr-tracker/ScoringGuide";
import Image from "next/image";

const REPO_URL = "https://github.com/PRODHOSH/gssoc-tracker";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [state, setState]       = useState<"idle" | "loading" | "error">("idle");
  const [errMsg, setErrMsg]     = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    const u = username.trim().replace(/^@/, "");
    if (!u) return;
    setState("loading");
    try {
      const res  = await fetch(`/api/pr-tracker?username=${encodeURIComponent(u)}`);
      const data = await res.json() as { error?: string };
      if (!res.ok) { setErrMsg(data.error ?? "Not found"); setState("error"); return; }
      router.push(`/pr-tracker/${encodeURIComponent(u)}`);
    } catch {
      setErrMsg("Couldn't reach the API. Try again.");
      setState("error");
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: ds.canvasNight,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-sans)",
      padding: "40px 24px",
    }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: "100%", maxWidth: 440, textAlign: "center" }}
      >
        {/* Icon */}
        <div style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 52, height: 52, borderRadius: 14,
          background: "rgba(62,207,142,0.1)",
          border: "1px solid rgba(62,207,142,0.2)",
          marginBottom: 24,
        }}>
          <GitPullRequest size={24} color={ds.primary} />
        </div>

        <h1 style={{
          margin: "0 0 8px",
          fontSize: "clamp(28px, 5vw, 38px)", fontWeight: 700,
          color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1,
        }}>
          GSSoC PR Tracker
        </h1>

        <p style={{ margin: "0 0 36px", fontSize: 15, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
          Enter your GitHub username to see your contribution points
        </p>

        {/* Search form */}
        <form onSubmit={submit} style={{ display: "flex", gap: 8 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <GitHubIcon
              width={14} height={14}
              style={{
                position: "absolute", left: 13, top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(255,255,255,0.25)", pointerEvents: "none",
              }}
            />
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setState("idle"); setErrMsg(""); }}
              placeholder="GitHub username…"
              autoFocus
              autoComplete="off"
              suppressHydrationWarning
              style={{
                width: "100%", height: 48,
                paddingLeft: 38, paddingRight: 14,
                borderRadius: 10,
                border: `1.5px solid ${state === "error" ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.08)"}`,
                background: "rgba(255,255,255,0.04)",
                color: "#fff", fontSize: 15,
                fontFamily: fontMono, outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(62,207,142,0.45)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = state === "error" ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.08)")}
            />
          </div>

          <button
            type="submit"
            disabled={state === "loading" || !username.trim()}
            style={{
              height: 48, padding: "0 22px",
              borderRadius: 10, border: "none",
              background: state === "loading" ? "rgba(62,207,142,0.55)" : ds.primary,
              color: ds.onPrimary, fontSize: 14, fontWeight: 600,
              cursor: state === "loading" ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
              transition: "background 0.13s",
            }}
          >
            {state === "loading"
              ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Loading…</>
              : "Track →"}
          </button>
        </form>

        {state === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginTop: 10, fontSize: 13, color: "#f87171" }}
          >
            <AlertCircle size={13} /> {errMsg}
          </motion.div>
        )}

        {/* Points System button */}
        <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
          <ScoringGuide />
        </div>
      </motion.div>

      {/* Bottom bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          padding: "14px 24px 18px",
          background: "linear-gradient(to top, rgba(23,23,23,0.95) 70%, transparent)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <a
            href="https://github.com/PRODHOSH"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
              padding: "6px 12px", borderRadius: ds.rFull,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <Image src="https://avatars.githubusercontent.com/PRODHOSH" alt="PRODHOSH" width={22} height={22} unoptimized style={{ borderRadius: "50%", display: "block" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
              Built by <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>@PRODHOSH</span>
            </span>
          </a>

          <a
            href={REPO_URL} target="_blank" rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 6, textDecoration: "none",
              padding: "6px 14px", borderRadius: ds.rFull,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.45)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(202,138,4,0.5)"; e.currentTarget.style.color = "#fbbf24"; e.currentTarget.style.background = "rgba(202,138,4,0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
          >
            <Star size={13} /> Star on GitHub
          </a>

          <SubscribeButton />
        </div>

        <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
          Not affiliated with GirlScript Summer of Code or GirlScript Foundation ·{" "}
          <a href="/terms" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "underline" }}>Terms &amp; Privacy</a>
        </p>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
