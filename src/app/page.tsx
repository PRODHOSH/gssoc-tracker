"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { UserSearch, ShieldCheck, Loader2, AlertCircle } from "lucide-react";

const GalaxyBackground = dynamic(
  () =>
    import("@/components/landing/GalaxyBackground").then(
      (m) => m.GalaxyBackground
    ),
  { ssr: false }
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);
import { HomeNavbar } from "@/components/home/HomeNavbar";
import { HomeFooter } from "@/components/home/HomeFooter";

type Role = "contributor" | "mentor";

export default function HomePage() {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [input, setInput] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("gssoc_guidelines_v1")) setShowBanner(true);
  }, []);

  function dismissBanner() {
    localStorage.setItem("gssoc_guidelines_v1", "1");
    setShowBanner(false);
  }

  function handleSelectRole(selectedRole: Role) {
    setRole(selectedRole);
    setInput("");
    setState("idle");
    setErrMsg("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const raw = input.trim().replace(/^@/, "");
    if (!raw || !role) return;
    setState("loading");

    try {
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(raw)}`);
      if (res.status === 404) {
        setErrMsg("GitHub user not found");
        setState("error");
        return;
      }
      if (!res.ok) {
        setErrMsg("Couldn't reach GitHub. Try again.");
        setState("error");
        return;
      }
      
      setState("success");
      setTimeout(() => {
        router.push(
          role === "contributor"
            ? `/pr-tracker/${encodeURIComponent(raw)}`
            : `/mentor/${encodeURIComponent(raw)}`
        );
      }, 2000);
    } catch {
      setErrMsg("Couldn't reach the API. Try again.");
      setState("error");
    }
  }

  return (
    <div className="bg-canvas-night font-sans overflow-x-hidden min-h-screen flex flex-col relative text-ghost-white">
      {/* Three.js WebGPU Galaxy Background */}
      <GalaxyBackground className="fixed inset-0 z-0" />

      {/* Overlay for content readability */}
      <div className="fixed inset-0 z-[1] bg-canvas-night/50 pointer-events-none" />
      {/* What's new banner */}
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-primary/10 border-b border-primary/20 px-5 py-2 flex items-center justify-center gap-3 backdrop-blur-md">
          <span className="text-xs text-ghost-white/80 leading-none">
            📋 GSSoC 2026 scoring guidelines have been updated —{" "}
            <a
              href="https://gssoc.girlscript.org/guidelines/labeling"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-bold hover:underline"
            >
              see the new label guide
            </a>
          </span>
          <button
            onClick={dismissBanner}
            className="text-ghost-white/50 hover:text-ghost-white text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      <div className="relative z-10">
        <HomeNavbar />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center relative px-8 py-12 z-10">

        {/* Content Canvas */}
        <div className="max-w-2xl w-full text-center z-10 flex flex-col items-center">
          {/* Hero Section */}
          <div className="mb-12 space-y-4">
            <h1 className="font-display text-5xl md:text-6xl font-extrabold tracking-tight text-ghost-white uppercase">
              GSSoC Tracker
            </h1>
            <p className="font-display text-2xl font-bold text-muted-steel opacity-80 max-w-lg mx-auto">
              Select your role to get started
            </p>
          </div>

          {/* Role Picker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 w-full">
            {/* Contributor Card */}
            <button
              className={`group flex flex-col items-start p-8 bg-pure-surface border rounded-xl transition-all duration-400 ease-out text-left ${
                role === "contributor"
                  ? "border-primary scale-[1.02] bg-primary/5"
                  : "border-primary/40 hover:border-primary"
              }`}
              onClick={() => handleSelectRole("contributor")}
            >
              <UserSearch
                className={`w-8 h-8 mb-4 transition-colors ${
                  role === "contributor" ? "text-primary" : "text-muted-steel group-hover:text-primary"
                }`}
              />
              <span className="font-mono text-[11px] uppercase tracking-widest text-ghost-white mb-1 font-bold">
                Role 01
              </span>
              <span className="font-display text-2xl font-bold text-ghost-white">
                Contributor
              </span>
              <p className="font-sans text-sm text-muted-steel mt-2">
                Track your contributions, points, and leaderboard rank in real-time.
              </p>
            </button>

            {/* Mentor Card */}
            <button
              className={`group flex flex-col items-start p-8 bg-pure-surface border rounded-xl transition-all duration-400 ease-out text-left ${
                role === "mentor"
                  ? "border-primary scale-[1.02] bg-primary/5"
                  : "border-primary/40 hover:border-primary"
              }`}
              onClick={() => handleSelectRole("mentor")}
            >
              <ShieldCheck
                className={`w-8 h-8 mb-4 transition-colors ${
                  role === "mentor" ? "text-primary" : "text-muted-steel group-hover:text-primary"
                }`}
              />
              <span className="font-mono text-[11px] uppercase tracking-widest text-ghost-white mb-1 font-bold">
                Role 02
              </span>
              <span className="font-display text-2xl font-bold text-ghost-white">Mentor</span>
              <p className="font-sans text-sm text-muted-steel mt-2">
                Monitor project health, review PRs, and manage contributor workflow.
              </p>
            </button>
          </div>

          {/* Input Section */}
          <div
            className={`transition-all duration-500 ease-out w-full max-w-md mx-auto ${
              role ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none absolute"
            }`}
          >
            <form
              onSubmit={handleSubmit}
              className="bg-pure-surface border border-whisper-border p-2 flex flex-col md:flex-row gap-2 w-full rounded-lg"
            >
              <div className="flex-grow flex items-center px-4 bg-canvas-night/50 border border-whisper-border focus-within:border-primary transition-colors rounded-md">
                <GithubIcon className="text-muted-steel mr-3 w-4 h-4" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setState("idle");
                    setErrMsg("");
                  }}
                  className="bg-transparent border-none focus:ring-0 text-ghost-white font-mono w-full py-3 placeholder:text-muted-steel/50 outline-none text-sm"
                  placeholder="GitHub username..."
                  autoComplete="off"
                />
              </div>
              <button
                type="submit"
                disabled={state === "loading" || !input.trim()}
                className="bg-primary text-canvas-night px-8 py-3 font-mono text-xs uppercase font-bold tracking-widest transition-transform active:translate-y-px rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {state === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Track"}
              </button>
            </form>

            <div className="mt-4 flex justify-center items-center gap-2 font-mono text-xs text-primary/80 font-bold">
              <span
                className={`w-2 h-2 rounded-full ${
                  state === "error"
                    ? "bg-red-500"
                    : state === "success"
                    ? "bg-green-500 animate-pulse"
                    : "bg-primary animate-pulse"
                }`}
              ></span>
              <span className="tracking-widest uppercase">
                {state === "error"
                  ? errMsg
                  : state === "success"
                  ? "USER LOCATED. REDIRECTING..."
                  : state === "loading"
                  ? "FETCHING TELEMETRY..."
                  : "AWAITING SELECTION PARAMETERS"}
              </span>
            </div>
          </div>
        </div>
      </main>

      <div className="relative z-10">
        <HomeFooter />
      </div>
    </div>
  );
}
