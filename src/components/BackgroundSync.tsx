"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, CheckCircle } from "lucide-react";

interface BackgroundSyncProps {
  username: string;
  isMentor?: boolean;
}

/**
 * Fires a background sync on page load.
 * When sync finds new data, refreshes the server component.
 *
 * Bug fixes vs v1:
 * - sessionStorage key prevents infinite loop after router.refresh() (ref was being reset)
 * - setSyncing(false) is ALWAYS called after sync (was missing after router.refresh())
 * - Removed isEmpty/full-screen overlay — always show small chip, never block UI
 * - revalidatePath is called server-side so cache is busted before router.refresh()
 */
export function BackgroundSync({ username, isMentor = false }: BackgroundSyncProps) {
  const router = useRouter();
  const hasRun = useRef(false);
  const [syncing, setSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  useEffect(() => {
    // sessionStorage prevents re-fire after router.refresh() re-mounts this component
    const storageKey = `gssoc_synced_${isMentor ? "m" : "c"}_${username}`;
    const lastSyncTime = sessionStorage.getItem(storageKey);
    const THIRTY_MINS = 30 * 60 * 1000;

    // If we already synced this username in this browser session within 30 min, skip
    if (lastSyncTime && Date.now() - Number(lastSyncTime) < THIRTY_MINS) return;

    // StrictMode guard (runs twice in dev)
    if (hasRun.current) return;
    hasRun.current = true;

    setSyncing(true);

    const endpoint = isMentor
      ? `/api/sync-data?username=${encodeURIComponent(username)}&mode=mentor`
      : `/api/sync-data?username=${encodeURIComponent(username)}`;

    fetch(endpoint, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: { synced: boolean }) => {
        // Always record the sync attempt so we don't retry for 30 min
        sessionStorage.setItem(storageKey, String(Date.now()));

        if (data?.synced) {
          // New data fetched — refresh server component then hide spinner
          router.refresh();
          // Small delay to let the refresh settle before hiding chip
          setTimeout(() => {
            setSyncing(false);
            setJustSynced(true);
            setTimeout(() => setJustSynced(false), 3000);
          }, 800);
        } else {
          // Data was already fresh — no refresh needed
          setSyncing(false);
        }
      })
      .catch(() => {
        // Silent fail — user keeps seeing current data
        setSyncing(false);
      });
  }, [username, isMentor, router]);

  // Small unobtrusive chip in the bottom-right corner
  if (syncing) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "7px 13px",
          borderRadius: 9999,
          background: "rgba(14,14,14,0.85)",
          border: "1px solid rgba(62,207,142,0.25)",
          fontSize: 12,
          color: "rgba(255,255,255,0.6)",
          zIndex: 50,
          backdropFilter: "blur(10px)",
          pointerEvents: "none",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <RefreshCw size={11} color="#3ecf8e" style={{ animation: "spin 1s linear infinite" }} />
        Syncing latest PRs…
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Brief "Up to date" confirmation after a sync
  if (justSynced) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "7px 13px",
          borderRadius: 9999,
          background: "rgba(14,14,14,0.85)",
          border: "1px solid rgba(62,207,142,0.25)",
          fontSize: 12,
          color: "#3ecf8e",
          zIndex: 50,
          backdropFilter: "blur(10px)",
          pointerEvents: "none",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <CheckCircle size={11} color="#3ecf8e" />
        Up to date
      </div>
    );
  }

  return null;
}
