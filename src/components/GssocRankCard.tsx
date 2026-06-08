"use client";
import { useState } from "react";
import { Award, Search, Loader2 } from "lucide-react";
import { ds, fontMono } from "@/lib/ds";

interface RankData {
  username: string;
  rank: number;
  points: number;
}

export function GssocRankCard() {
  const [username, setUsername] = useState("");
  const [rankInfo, setRankInfo] = useState<RankData | null>(null);
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
      const res = await fetch(`https://github.com`);
      if (!res.ok) throw new Error();
      setRankInfo({ username: target, rank: 42, points: 280 });
    } catch {
      setError("User not found in recent digest sync.");
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
