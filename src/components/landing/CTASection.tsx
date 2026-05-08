"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { GitHubIcon } from "@/components/icons";
import { ds } from "@/lib/ds";

export function CTASection() {
  const router = useRouter();
  const [u, setU]     = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const val = u.trim().replace(/^@/, "");
    if (!val) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/lookup?username=${encodeURIComponent(val)}`);
      if (res.ok) router.push(`/dashboard/${encodeURIComponent(val)}`);
      else setBusy(false);
    } catch { setBusy(false); }
  }

  return (
    <section style={{ background: ds.canvasNight, padding: "96px 24px" }}>
      <div style={{ maxWidth: 580, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{
          margin: "0 0 14px",
          fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 700,
          color: ds.onDark, letterSpacing: "-0.025em", lineHeight: 1.2,
        }}>
          Ready to track your progress?
        </h2>
        <p style={{ margin: "0 0 36px", fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>
          Enter your GitHub username and get a live breakdown of your GSSoC 2026 score and rank.
        </p>

        <form onSubmit={submit} style={{ display: "flex", gap: 8, maxWidth: 400, margin: "0 auto" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <GitHubIcon width={13} height={13} style={{
              position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              color: "rgba(255,255,255,0.3)", pointerEvents: "none",
            }} />
            <input type="text" value={u}
              onChange={e => setU(e.target.value)}
              placeholder="GitHub username…"
              style={{
                width: "100%", height: 46,
                padding: "0 14px 0 34px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.06)",
                color: ds.onDark, fontSize: 14, outline: "none",
                fontFamily: "var(--font-sans)",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(62,207,142,0.5)")}
              onBlur={e  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>
          <button type="submit" disabled={busy || !u.trim()}
            style={{
              height: 46, padding: "0 20px", borderRadius: 8,
              border: "none", background: ds.primary, color: ds.onPrimary,
              fontSize: 14, fontWeight: 600,
              cursor: busy ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 6,
              flexShrink: 0, opacity: busy ? 0.7 : 1,
              transition: "background 0.13s",
            }}
            onMouseEnter={e => { if (!busy) e.currentTarget.style.background = ds.primaryDeep; }}
            onMouseLeave={e => { e.currentTarget.style.background = ds.primary; }}
          >
            {busy
              ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Checking…</>
              : <>Go <ArrowRight size={14} /></>}
          </button>
        </form>

        <p style={{ margin: "20px 0 0", fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
          No sign-up required · Free forever · Open source
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  );
}
