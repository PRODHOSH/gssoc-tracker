import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { ds, fontMono } from "@/lib/ds";
import { PrChecker } from "@/components/PrChecker";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "PR Validator · GSSoC Tracker",
  description:
    "Paste any GitHub PR link and instantly see if it qualifies for GSSoC 2026 points — checks approval labels, merge status, official repo, and shows the exact points breakdown.",
  openGraph: {
    title: "GSSoC PR Validator",
    description: "Check if your PR qualifies for GSSoC 2026 and see the exact points breakdown.",
    url: "https://gssoc-tracker.vercel.app/pr-check",
  },
};

export default function PrCheckPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: ds.canvasSoft,
      fontFamily: "var(--font-sans)",
      padding: "0 24px 80px",
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "22px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            color: ds.inkFaint, textDecoration: "none",
            fontSize: 13, padding: "4px 8px", borderRadius: ds.rSm,
          }}
        >
          <ArrowLeft size={13} /> Home
        </Link>
        <ThemeToggle />
      </div>

      <div style={{ maxWidth: 640, margin: "36px auto 0" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: ds.rMd,
              background: "rgba(62,207,142,0.1)",
              border: "1px solid rgba(62,207,142,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <ShieldCheck size={20} color={ds.primary} />
            </div>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: ds.primaryDeep, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: fontMono }}>
                PR Validator
              </p>
              <h1 style={{ margin: 0, fontSize: "clamp(20px,4vw,26px)", fontWeight: 700, color: ds.ink, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
                Does this PR count for GSSoC?
              </h1>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: ds.inkMute, lineHeight: 1.7, maxWidth: 520 }}>
            Paste any GitHub PR link. We check every condition — approval label, merge status, official project list — and show the exact points breakdown.
          </p>
        </div>

        {/* Checker */}
        <PrChecker />

        {/* Info note */}
        <div style={{
          marginTop: 32,
          padding: "12px 16px",
          borderRadius: ds.rMd,
          background: "rgba(62,207,142,0.04)",
          border: `1px solid ${ds.hairlineCool}`,
        }}>
          <p style={{ margin: 0, fontSize: 12, color: ds.inkMute, lineHeight: 1.7 }}>
            This checks whether the PR is approved, merged, and part of an officially registered GSSoC 2026 project — then shows you exactly how many points it is worth.{" "}
            <Link href="/terms" style={{ color: ds.primaryDeep, textDecoration: "underline" }}>
              Read the terms
            </Link>
            {" "}for more on how this works.
          </p>
        </div>

        {/* Disclaimer */}
        <p style={{ marginTop: 20, fontSize: 11, color: ds.inkFaint, textAlign: "center", lineHeight: 1.7 }}>
          Not affiliated with GirlScript Summer of Code or GirlScript Foundation. Built for the community.
        </p>
      </div>
    </div>
  );
}
