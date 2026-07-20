import Link from "next/link";
import { GitPullRequest, Home, Search, AlertCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found | GSSoC PR Tracker",
  description: "The page you're looking for doesn't exist. Head back to the GSSoC PR Tracker.",
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-canvas-night, #0f0f0f)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
        padding: "40px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(62,207,142,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: "rgba(62,207,142,0.08)",
          border: "1px solid rgba(62,207,142,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 32,
          position: "relative",
        }}
      >
        <GitPullRequest size={28} color="#3ecf8e" />
        <div
          style={{
            position: "absolute",
            top: -6,
            right: -6,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "rgba(248,113,113,0.15)",
            border: "1px solid rgba(248,113,113,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AlertCircle size={12} color="#f87171" />
        </div>
      </div>

      {/* 404 number */}
      <div
        style={{
          fontSize: "clamp(80px, 15vw, 120px)",
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: "-0.05em",
          background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: 16,
          userSelect: "none",
        }}
      >
        404
      </div>

      {/* Heading */}
      <h1
        style={{
          margin: "0 0 12px",
          fontSize: "clamp(20px, 4vw, 28px)",
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "-0.03em",
          textAlign: "center",
        }}
      >
        Page not found
      </h1>

      <p
        style={{
          margin: "0 0 40px",
          fontSize: 15,
          color: "rgba(255,255,255,0.35)",
          textAlign: "center",
          maxWidth: 360,
          lineHeight: 1.6,
        }}
      >
        This page doesn&apos;t exist or was moved. Try searching for a GitHub username to track GSSoC contributions.
      </p>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 22px",
            borderRadius: 10,
            background: "#3ecf8e",
            color: "#0a1f15",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <Home size={15} />
          Back to Home
        </Link>

        <Link
          href="/pr-tracker"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 22px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.6)",
            fontSize: 14,
            fontWeight: 500,
            textDecoration: "none",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            e.currentTarget.style.color = "rgba(255,255,255,0.6)";
          }}
        >
          <Search size={15} />
          Search a username
        </Link>
      </div>

      {/* Footer note */}
      <p
        style={{
          position: "absolute",
          bottom: 24,
          margin: 0,
          fontSize: 12,
          color: "rgba(255,255,255,0.15)",
          textAlign: "center",
        }}
      >
        GSSoC PR Tracker · Not affiliated with GirlScript Foundation
      </p>
    </div>
  );
}
