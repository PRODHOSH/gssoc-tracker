"use client";
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, Star, GitPullRequest, Users, ArrowLeft, FolderGit2 } from "lucide-react";
import { ds, fontMono } from "@/lib/ds";
import { GitHubIcon } from "@/components/icons";
import { SubscribeButton } from "@/components/SubscribeModal";
import { HomePointsGuide } from "@/components/HomePointsGuide";
import Image from "next/image";

const REPO_URL = "https://github.com/PRODHOSH/gssoc-tracker";

type Role = "contributor" | "mentor" | "project-admin";

const ROLES: { id: Role; icon: React.ReactNode; label: string; desc: string; border: string; bg: string; hoverBorder: string; hoverBg: string }[] = [
  {
    id: "contributor",
    icon: <GitPullRequest size={20} color={ds.primary} />,
    label: "Contributor",
    desc: "Track PRs you've submitted with GSSoC labels",
    border: "rgba(62,207,142,0.2)", bg: "rgba(62,207,142,0.05)",
    hoverBorder: "rgba(62,207,142,0.5)", hoverBg: "rgba(62,207,142,0.1)",
  },
  {
    id: "mentor",
    icon: <Users size={20} color="#fbbf24" />,
    label: "Mentor",
    desc: "Track PRs you've reviewed as a GSSoC mentor",
    border: "rgba(251,191,36,0.2)", bg: "rgba(251,191,36,0.05)",
    hoverBorder: "rgba(251,191,36,0.5)", hoverBg: "rgba(251,191,36,0.1)",
  },
  {
    id: "project-admin",
    icon: <FolderGit2 size={20} color="#818cf8" />,
    label: "Project Admin",
    desc: "Track issues, PRs & admin activity for your GSSoC project",
    border: "rgba(129,140,248,0.2)", bg: "rgba(129,140,248,0.05)",
    hoverBorder: "rgba(129,140,248,0.5)", hoverBg: "rgba(129,140,248,0.1)",
  },
];

export default function Home() {
  const router = useRouter();
  const [step, setStep]         = useState<"role" | "input">("role");
  const [role, setRole]         = useState<Role | null>(null);
  const [input, setInput]       = useState("");
  const [state, setState]       = useState<"idle" | "loading" | "error">("idle");
  const [errMsg, setErrMsg]     = useState("");
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("gssoc_guidelines_v1")) setShowBanner(true);
  }, []);

  function dismissBanner() {
    localStorage.setItem("gssoc_guidelines_v1", "1");
    setShowBanner(false);
  }

  function selectRole(r: Role) {
    setRole(r);
    setInput("");
    setState("idle");
    setErrMsg("");
    setStep("input");
  }

  function goBack() {
    setStep("role");
    setState("idle");
    setErrMsg("");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const raw = input.trim().replace(/^@/, "");
    if (!raw || !role) return;
    setState("loading");

    try {
      const res = await fetch(`/api/github-user?username=${encodeURIComponent(raw)}`);
      if (res.status === 404) { setErrMsg("GitHub user not found"); setState("error"); return; }
      if (!res.ok) { setErrMsg("Couldn't reach GitHub. Try again."); setState("error"); return; }
      if (role === "contributor") {
        router.push(`/pr-tracker/${encodeURIComponent(raw)}`);
      } else if (role === "mentor") {
        router.push(`/mentor/${encodeURIComponent(raw)}`);
      } else {
        router.push(`/project-admin/${encodeURIComponent(raw)}`);
      }
    } catch {
      setErrMsg("Couldn't reach the API. Try again.");
      setState("error");
    }
  }

  const activeRole = ROLES.find((r) => r.id === role);

  return (
    <div style={{
      minHeight: "100vh",
      background: ds.canvasNight,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-sans)",
      padding: "40px 24px",
      position: "relative",
    }}>

      {/* What's new banner */}
      {showBanner && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          background: "rgba(62,207,142,0.07)",
          borderBottom: "1px solid rgba(62,207,142,0.15)",
          padding: "9px 20px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1 }}>
            📋 GSSoC 2026 scoring guidelines have been updated —{" "}
            <a href="https://gssoc.girlscript.org/guidelines/labeling" target="_blank" rel="noopener noreferrer" style={{ color: ds.primary, fontWeight: 600, textDecoration: "none" }}>
              see the new label guide
            </a>
          </span>
          <button
            onClick={dismissBanner}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.3)", fontSize: 16, lineHeight: 1,
              padding: "0 4px", flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ width: "100%", maxWidth: 480, textAlign: "center" }}
      >
        {/* Icon */}
        <div style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 52, height: 52, borderRadius: 14,
          background: "rgba(62,207,142,0.1)", border: "1px solid rgba(62,207,142,0.2)",
          marginBottom: 24,
        }}>
          <GitPullRequest size={24} color={ds.primary} />
        </div>

        <h1 style={{
          margin: "0 0 8px",
          fontSize: "clamp(26px, 5vw, 36px)", fontWeight: 700,
          color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1,
        }}>
          GSSoC Tracker
        </h1>

        <p style={{ margin: "0 0 36px", fontSize: 15, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
          {step === "role" ? "Who are you in GSSoC 2026?" : "Enter your details to get started"}
        </p>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {step === "role" && (
            <motion.div
              key="role"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              {ROLES.map((r) => (
                <RoleCard key={r.id} role={r} onSelect={selectRole} />
              ))}
              <div style={{ marginTop: 8, display: "flex", justifyContent: "center" }}>
                <HomePointsGuide />
              </div>
              <div style={{ marginTop: 6, textAlign: "center" }}>
                <a
                  href="/pr-check"
                  style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.13s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = ds.primary)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                >
                  or validate a specific PR →
                </a>
              </div>
            </motion.div>
          )}

          {step === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {/* Role pill + back */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <button
                  onClick={goBack}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(255,255,255,0.35)", fontSize: 13, padding: "4px 0",
                  }}
                >
                  <ArrowLeft size={13} /> Back
                </button>
                {activeRole && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 12px", borderRadius: 9999,
                    border: `1px solid ${activeRole.border}`,
                    background: activeRole.bg,
                    fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)",
                  }}>
                    {activeRole.icon && <span style={{ transform: "scale(0.75)", display: "inline-flex" }}>{activeRole.icon}</span>}
                    {activeRole.label}
                  </span>
                )}
              </div>

              <form onSubmit={submit} style={{ display: "flex", gap: 8 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                    <GitHubIcon width={14} height={14} style={{ color: "rgba(255,255,255,0.25)" }} />
                  </div>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => { setInput(e.target.value); setState("idle"); setErrMsg(""); }}
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
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(62,207,142,0.45)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = state === "error" ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.08)")}
                  />
                </div>

                <button
                  type="submit"
                  disabled={state === "loading" || !input.trim()}
                  style={{
                    height: 48, padding: "0 22px",
                    borderRadius: 10, border: "none",
                    background: state === "loading" ? "rgba(62,207,142,0.55)" : ds.primary,
                    color: ds.onPrimary, fontSize: 14, fontWeight: 600,
                    cursor: state === "loading" || !input.trim() ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
                    transition: "background 0.13s",
                    opacity: !input.trim() ? 0.5 : 1,
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

            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bottom bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
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
            style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", padding: "6px 12px", borderRadius: ds.rFull, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
          >
            <Image src="https://avatars.githubusercontent.com/PRODHOSH" alt="PRODHOSH" width={22} height={22} unoptimized style={{ borderRadius: "50%", display: "block" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
              Built by <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>@PRODHOSH</span>
            </span>
          </a>

          <a
            href={REPO_URL} target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none", padding: "6px 14px", borderRadius: ds.rFull, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.45)", transition: "all 0.15s" }}
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

function RoleCard({ role, onSelect }: { role: typeof ROLES[number]; onSelect: (r: Role) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={() => onSelect(role.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "flex-start", gap: 14,
        padding: "16px 18px", borderRadius: 12, cursor: "pointer",
        background: hovered ? role.hoverBg : role.bg,
        border: `1.5px solid ${hovered ? role.hoverBorder : role.border}`,
        textAlign: "left", transition: "all 0.15s", width: "100%",
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: hovered ? role.hoverBg : role.bg,
        border: `1px solid ${role.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginTop: 1,
        transition: "all 0.15s",
      }}>
        {role.icon}
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 3 }}>{role.label}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.45 }}>{role.desc}</div>
      </div>
      <div style={{ marginLeft: "auto", alignSelf: "center", color: "rgba(255,255,255,0.2)", fontSize: 18, flexShrink: 0 }}>›</div>
    </button>
  );
}
