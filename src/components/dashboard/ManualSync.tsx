"use client";
import { useState } from "react";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { ds, fontMono } from "@/lib/ds";

interface ManualSyncProps {
  compact?: boolean;
}

export function ManualSync({ compact = false }: ManualSyncProps) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<{ score?: number; rank?: number; changed?: boolean } | null>(null);
  const [errMsg, setErrMsg] = useState("");

  async function handleSync() {
    setState("loading");
    setResult(null);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: {
          "x-sync-secret": process.env.NEXT_PUBLIC_SYNC_SECRET ?? "",
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sync failed");
      setResult(data);
      setState("success");
      setTimeout(() => setState("idle"), 6000);
      // Reload page to show fresh data
      window.location.reload();
    } catch (e) {
      setErrMsg((e as Error).message);
      setState("error");
      setTimeout(() => setState("idle"), 6000);
    }
  }

  if (compact) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {state === "success" && result && (
          <span style={{ fontSize: 12, color: ds.primaryDeep, fontFamily: fontMono }}>
            #{result.rank} · {result.score?.toLocaleString()} pts {result.changed ? "✓ updated" : "· no change"}
          </span>
        )}
        {state === "error" && (
          <span style={{ fontSize: 12, color: "#dc2626" }}>{errMsg}</span>
        )}
        <button
          onClick={handleSync}
          disabled={state === "loading"}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            height: 30, padding: "0 12px",
            borderRadius: ds.rSm,
            border: `1px solid ${ds.hairline}`,
            background: ds.canvas,
            color: state === "loading" ? ds.inkFaint : ds.inkMute,
            cursor: state === "loading" ? "not-allowed" : "pointer",
            fontSize: 12, fontWeight: 500,
          }}
        >
          <RefreshCw size={12} style={{ animation: state === "loading" ? "spin 1s linear infinite" : "none" }} />
          {state === "loading" ? "Syncing…" : "Sync now"}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleSync}
        disabled={state === "loading"}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          width: "100%",
          height: 38,
          borderRadius: ds.rSm,
          border: "none",
          background: ds.primary,
          color: ds.onPrimary,
          fontSize: 14, fontWeight: 500,
          cursor: state === "loading" ? "not-allowed" : "pointer",
          opacity: state === "loading" ? 0.7 : 1,
        }}
      >
        <RefreshCw size={14} style={{ animation: state === "loading" ? "spin 1s linear infinite" : "none" }} />
        {state === "loading" ? "Fetching from GSSoC…" : "Sync my data"}
      </button>

      {state === "success" && (
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, color: ds.primaryDeep, fontSize: 13 }}>
          <CheckCircle size={14} />
          Score: {result?.score?.toLocaleString()} · Rank: #{result?.rank} · {result?.changed ? "Updated!" : "No change"}
        </div>
      )}
      {state === "error" && (
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, color: "#dc2626", fontSize: 13 }}>
          <AlertCircle size={14} />
          {errMsg}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
