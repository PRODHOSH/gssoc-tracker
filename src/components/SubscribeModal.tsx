"use client";
import { useState, useEffect, FormEvent } from "react";
import { createPortal } from "react-dom";
import { X, Bell, Loader2, CheckCircle, AlertCircle, GitPullRequest } from "lucide-react";
import { ds, fontMono } from "@/lib/ds";

type Frequency = "on-change" | "daily";
type State = "idle" | "loading" | "success" | "error";

function Modal({ onClose }: { onClose: () => void }) {
  const [github, setGithub]       = useState("");
  const [email, setEmail]         = useState("");
  const [freq, setFreq]           = useState<Frequency>("on-change");
  const [state, setState]         = useState<State>("idle");
  const [errMsg, setErrMsg]       = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    setErrMsg("");
    try {
      const res  = await fetch("/api/subscribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ github: github.trim(), email: email.trim(), frequency: freq }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) { setErrMsg(data.error ?? "Something went wrong"); setState("error"); return; }
      setState("success");
    } catch {
      setErrMsg("Network error. Please try again.");
      setState("error");
    }
  }

  const inputStyle = (hasError = false): React.CSSProperties => ({
    width: "100%", height: 42,
    paddingLeft: 12, paddingRight: 12,
    borderRadius: 8,
    border: `1.5px solid ${hasError ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)"}`,
    background: "rgba(255,255,255,0.04)",
    color: "#fff", fontSize: 14,
    fontFamily: fontMono,
    outline: "none",
    transition: "border-color 0.15s",
  });

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(10,10,10,0.7)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#1a1a1a",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          width: "100%", maxWidth: 420,
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          animation: "subSlideUp 0.2s ease",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: "rgba(62,207,142,0.1)",
              border: "1px solid rgba(62,207,142,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Bell size={15} color={ds.primary} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#fff" }}>
                Get score alerts
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                Email you when your GSSoC score changes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, flexShrink: 0,
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 7, background: "transparent",
              color: "rgba(255,255,255,0.4)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={13} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px" }}>
          {state === "success" ? (
            <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
              <CheckCircle size={40} color={ds.primary} style={{ marginBottom: 14 }} />
              <p style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#fff" }}>
                You&apos;re subscribed!
              </p>
              <p style={{ margin: "0 0 20px", fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                We&apos;ll email <strong style={{ color: "rgba(255,255,255,0.6)" }}>@{github}</strong> whenever
                {freq === "daily" ? " we have a daily digest" : " your score or rank changes"}.
              </p>
              <button
                onClick={onClose}
                style={{
                  padding: "8px 20px", borderRadius: 8, border: "none",
                  background: "rgba(62,207,142,0.12)", color: ds.primary,
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* GitHub username */}
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  GitHub Username
                </label>
                <div style={{ position: "relative" }}>
                  <GitPullRequest size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)", pointerEvents: "none" }} />
                  <input
                    type="text"
                    value={github}
                    onChange={e => { setGithub(e.target.value); setState("idle"); }}
                    placeholder="your-github-username"
                    required
                    suppressHydrationWarning
                    style={{ ...inputStyle(state === "error"), paddingLeft: 32 }}
                    onFocus={e => (e.currentTarget.style.borderColor = "rgba(62,207,142,0.4)")}
                    onBlur={e => (e.currentTarget.style.borderColor = state === "error" ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)")}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setState("idle"); }}
                  placeholder="you@example.com"
                  required
                  suppressHydrationWarning
                  style={inputStyle(state === "error")}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(62,207,142,0.4)")}
                  onBlur={e => (e.currentTarget.style.borderColor = state === "error" ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)")}
                />
              </div>

              {/* Frequency */}
              <div>
                <label style={{ display: "block", marginBottom: 8, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Alert Frequency
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {([
                    { value: "on-change", label: "On score change", desc: "Only when it changes" },
                    { value: "daily",     label: "Daily digest",    desc: "Every morning at 8 AM IST" },
                  ] as { value: Frequency; label: string; desc: string }[]).map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFreq(opt.value)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: `1.5px solid ${freq === opt.value ? "rgba(62,207,142,0.4)" : "rgba(255,255,255,0.08)"}`,
                        background: freq === opt.value ? "rgba(62,207,142,0.07)" : "transparent",
                        cursor: "pointer", textAlign: "left",
                        transition: "all 0.13s",
                      }}
                    >
                      <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 600, color: freq === opt.value ? ds.primary : "rgba(255,255,255,0.55)" }}>
                        {opt.label}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                        {opt.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {state === "error" && errMsg && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#f87171" }}>
                  <AlertCircle size={13} /> {errMsg}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={state === "loading" || !github.trim() || !email.trim()}
                style={{
                  height: 42, borderRadius: 9, border: "none",
                  background: state === "loading" ? "rgba(62,207,142,0.5)" : ds.primary,
                  color: "#1c1c1c", fontSize: 14, fontWeight: 700,
                  cursor: state === "loading" ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  transition: "background 0.13s",
                }}
              >
                {state === "loading"
                  ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Subscribing…</>
                  : <><Bell size={14} /> Subscribe</>
                }
              </button>

              <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", lineHeight: 1.5 }}>
                One-click unsubscribe in every email · No spam · Not affiliated with GirlScript
              </p>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes subSlideUp {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>,
    document.body
  );
}

export function SubscribeButton() {
  const [open, setOpen]       = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          textDecoration: "none",
          padding: "6px 14px",
          borderRadius: ds.rFull,
          border: "1px solid rgba(62,207,142,0.25)",
          background: "rgba(62,207,142,0.06)",
          fontSize: 12, fontWeight: 600,
          color: ds.primary,
          cursor: "pointer",
          transition: "all 0.15s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = "rgba(62,207,142,0.5)";
          e.currentTarget.style.background  = "rgba(62,207,142,0.1)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = "rgba(62,207,142,0.25)";
          e.currentTarget.style.background  = "rgba(62,207,142,0.06)";
        }}
      >
        <Bell size={12} />
        Get alerts
      </button>

      {mounted && open && <Modal onClose={() => setOpen(false)} />}
    </>
  );
}
