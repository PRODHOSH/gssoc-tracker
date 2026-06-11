"use client";
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, GitPullRequest, Users, ArrowLeft, Award, Search } from "lucide-react";
import { ds, fontMono } from "@/lib/ds";
import { HomePointsGuide } from "@/components/HomePointsGuide";

type Role = "contributor" | "mentor";

interface RoleConfig {
  id: Role;
  icon: React.ReactNode;
  label: string;
  desc: string;
  border: string;
  bg: string;
  hoverBorder: string;
  hoverBg: string;
}

const ROLES: RoleConfig[] = [
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
];

function EmbeddedGlobalRankCard() {
  const [username, setUsername] = useState("");
  const [rankInfo, setRankInfo] = useState<{ rank: number; points: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const target = username.trim().replace(/^@/, "");
    if (!target) return;

    setLoading(true);
    setError("");
    setRankInfo(null);

    try {
      const res = await fetch(`/data/main-digest.json`);
      if (!res.ok) throw new Error();
      const list = await res.json();
      const found = list.find((u: any) => u.username?.toLowerCase() === target.toLowerCase());
      
      if (found) {
        setRankInfo({ rank: found.rank || 0, points: found.points || 0 });
      } else {
        setError("User not found in recent digest sync.");
      }
    } catch {
      setError("Unable to read leaderboard metrics.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 12,
      padding: "16px",
      marginTop: 16,
      textAlign: "left"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
        <Award size={16} color={ds.primary} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Check Global Rank</span>
      </div>

      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder="GitHub username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            flex: 1,
            background: "rgba(0,0,0,0.2)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 6,
            padding: "6px 12px",
            color: "#fff",
            fontSize: 13,
            outline: "none"
          }}
        />
        <button type="submit" disabled={loading} style={{
          background: ds.primary,
          border: "none",
          borderRadius: 6,
          padding: "0 12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {loading ? <Loader2 size={14} className="animate-spin" color="#000" /> : <Search size={14} color="#000" />}
        </button>
      </form>

      {rankInfo && (
        <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>RANK</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: ds.primary, fontFamily: fontMono }}>#{rankInfo.rank}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>POINTS</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{rankInfo.points} pts</div>
          </div>
        </div>
      )}

      {error && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 8, margin: 0 }}>{error}</p>}
    </div>
  );
}

interface RoleCardProps {
  role: RoleConfig;
  onSelect: (id: Role) => void;
}

function RoleCard({ role, onSelect }: RoleCardProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => onSelect(role.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "16px 20px",
        borderRadius: 12,
        cursor: "pointer",
        textAlign: "left",
        border: `1px solid ${hovered ? role.hoverBorder : role.border}`,
        background: hovered ? role.hoverBg : role.bg,
        transition: "all 0.15s ease",
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
      }}
    >
      <div style={{ marginTop: 2 }}>{role.icon}</div>
      <div>
        <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#fff" }}>{role.label}</h3>
        <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>{role.desc}</p>
      </div>
    </div>
  );
}

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
      const res = await fetch(`https://github.com{encodeURIComponent(raw)}`);
      if (res.status === 404) { setErrMsg("GitHub user not found"); setState("error"); return; }
      if (!res.ok) { setErrMsg("Couldn't reach GitHub. Try again."); setState("error"); return; }
      router.push(role === "contributor" ? `/pr-tracker/${encodeURIComponent(raw)}` : `/mentor/${encodeURIComponent(raw)}`);
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
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            ×
          </button>
        </div>
      )}

      <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
          GSSoC Tracker
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 32 }}>
          Monitor your contributions and metrics live
        </p>

        <AnimatePresence mode="wait">
          {step === "role" ? (
            <motion.div
              key="role"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              {ROLES.map((r) => (
                <RoleCard key={r.id} role={r} onSelect={selectRole} />
              ))}
              
              <EmbeddedGlobalRankCard />
            </motion.div>
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <button
                onClick={goBack}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  marginBottom: 16,
                  padding: 0,
                }}
              >
                <ArrowLeft size={14} /> Back
              </button>

              <form onSubmit={submit} style={{ textAlign: "left" }}>
                <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8, display: "block" }}>
                  Enter your GitHub username
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g. nancy-verma780"
                    disabled={state === "loading"}
                    style={{
                      flex: 1,
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      color: "#fff",
                      fontSize: 14,
                      outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={state === "loading"}
                    style={{
                      background: activeRole?.id === "contributor" ? ds.primary : "#fbbf24",
                      color: "#000",
                      border: "none",
                      borderRadius: 8,
                      padding: "0 20px",
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {state === "loading" && <Loader2 size={16} className="animate-spin" />}
                    Track
                  </button>
                </div>

                {state === "error" && (
                  <div style={{
                    marginTop: 12,
                    background: "rgba(239,68,68,0.05)",
                    border: "1px solid rgba(239,68,68,0.15)",
                    borderRadius: 8,
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#ef4444",
                    fontSize: 13,
                  }}>
                    <AlertCircle size={16} />
                    <span>{errMsg}</span>
                  </div>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ marginTop: 48 }}>
          <HomePointsGuide />
        </div>
      </div>
    </div>
  );
}

