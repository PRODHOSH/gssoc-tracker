import Link from "next/link";
import { ds, fontMono } from "@/lib/ds";
import { ArrowLeft, GitPullRequest, AlertTriangle, Shield, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Terms & Privacy · GSSoC PR Tracker",
  description: "How this tool works, what data it accesses, and why it is not affiliated with GirlScript Summer of Code.",
};

const section = (icon: React.ReactNode, title: string, children: React.ReactNode) => (
  <div style={{ marginBottom: 40 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: "rgba(62,207,142,0.1)",
        border: "1px solid rgba(62,207,142,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
        {title}
      </h2>
    </div>
    <div style={{ paddingLeft: 42 }}>
      {children}
    </div>
  </div>
);

const p = (text: string | React.ReactNode) => (
  <p style={{ margin: "0 0 12px", fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.75 }}>
    {text}
  </p>
);

const highlight = (text: string) => (
  <span style={{ color: ds.primary, fontWeight: 600 }}>{text}</span>
);

const warn = (text: string | React.ReactNode) => (
  <div style={{
    margin: "12px 0",
    padding: "12px 16px",
    borderRadius: 8,
    background: "rgba(251,191,36,0.06)",
    border: "1px solid rgba(251,191,36,0.2)",
    fontSize: 13,
    color: "rgba(251,191,36,0.85)",
    lineHeight: 1.65,
  }}>
    {text}
  </div>
);

export default function TermsPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: ds.canvasNight,
      fontFamily: "var(--font-sans)",
      padding: "0 24px 80px",
    }}>
      {/* Nav */}
      <div style={{
        maxWidth: 680,
        margin: "0 auto",
        padding: "24px 0 0",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <Link href="/" style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          color: "rgba(255,255,255,0.35)", textDecoration: "none", fontSize: 13,
          padding: "4px 8px", borderRadius: 6,
        }}>
          <ArrowLeft size={13} /> Home
        </Link>
      </div>

      <div style={{ maxWidth: 680, margin: "48px auto 0" }}>
        {/* Header */}
        <div style={{ marginBottom: 52 }}>
          <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: ds.primaryDeep, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: fontMono }}>
            Terms &amp; Privacy
          </p>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(24px,4vw,32px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
            What this tool is, and what it isn't
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
            Built as a personal project to track GSSoC 2026 contributions.
            Read this before using it so you know exactly what data is accessed and how.
          </p>
        </div>

        {/* ── Disclaimer banner ── */}
        <div style={{
          marginBottom: 48,
          padding: "16px 20px",
          borderRadius: 12,
          background: "rgba(251,191,36,0.05)",
          border: "1px solid rgba(251,191,36,0.25)",
        }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <AlertTriangle size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, fontSize: 13, color: "rgba(251,191,36,0.9)", lineHeight: 1.7 }}>
              <strong>This tool is NOT affiliated with, endorsed by, or associated with GirlScript Summer of Code, GirlScript Foundation, or any of their official partners.</strong>{" "}
              GSSoC and GirlScript are trademarks of their respective owners.
            </p>
          </div>
        </div>

        {section(
          <GitPullRequest size={15} color={ds.primary} />,
          "What this tool does",
          <>
            {p("GSSoC PR Tracker is a personal analytics dashboard built by a GSSoC 2026 participant to track contribution points in a way the official leaderboard doesn't.")}
            {p(<>When you enter a GitHub username, the tool:{" "}</>)}
            <ul style={{ margin: "0 0 12px", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Fetches your public pull requests from the GitHub API",
                "Reads the labels attached to each PR (gssoc:approved, level:*, quality:*, type:*, etc.)",
                "Calculates a point score based on those labels using the GSSoC 2026 scoring formula",
                "Displays analytics: points over time, label distribution, difficulty breakdown",
              ].map((item) => (
                <li key={item} style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>{item}</li>
              ))}
            </ul>
            {p("Everything is computed client-side at request time. No data is stored, cached, or sold.")}
          </>
        )}

        {section(
          <AlertTriangle size={15} color="#fbbf24" />,
          "Key difference from the official tracker",
          <>
            {warn(
              <>
                <strong>The official GSSoC leaderboard only counts PRs merged into repos that are officially registered with GSSoC.</strong>
                {" "}This tool does not have that restriction.
              </>
            )}
            {p(<>
              This tracker reads <strong style={{ color: "rgba(255,255,255,0.75)" }}>all public PRs</strong> on your GitHub profile that carry GSSoC labels — regardless of whether the repo is officially listed in the GSSoC programme.
              That means your score here {highlight("may be higher")} than on the official leaderboard, because it includes contributions to repos that GSSoC hasn't approved.
            </>)}
            {p("Use this tool to understand your own activity and label patterns. For official standings, always refer to the GSSoC leaderboard.")}
          </>
        )}

        {section(
          <Shield size={15} color={ds.primary} />,
          "Data & privacy",
          <>
            {p("We do not collect, store, or share any personal information.")}
            <ul style={{ margin: "0 0 12px", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "No accounts, no sign-up, no cookies beyond what Next.js sets by default",
                "Your GitHub username is only used to query the public GitHub API",
                "PR data is fetched live and not persisted on any server we control",
                "No analytics, no tracking pixels, no third-party scripts that profile you",
              ].map((item) => (
                <li key={item} style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>{item}</li>
              ))}
            </ul>
            {p("The only external API called is the GitHub REST API (api.github.com), which is subject to GitHub's own terms and rate limits.")}
          </>
        )}

        {section(
          <ExternalLink size={15} color="rgba(255,255,255,0.6)" />,
          "Why this was built",
          <>
            {p("The official GSSoC tracker is limited to repos registered in the programme. As a participant, I wanted a way to see all my labelled PRs, track points over time, and understand how the scoring formula works across everything I contributed to.")}
            {p("I built this for myself, found it useful, and made it public so other participants could use it too. It is a side project — not an official tool.")}
            {p(<>
              Source code is open on{" "}
              <a href="https://github.com/PRODHOSH/gssoc-tracker" target="_blank" rel="noopener noreferrer" style={{ color: ds.primary, textDecoration: "underline" }}>
                GitHub
              </a>. Issues and PRs welcome.
            </>)}
          </>
        )}

        {/* Footer */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: 24,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 10,
        }}>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
            Last updated: May 2026
          </p>
          <Link href="/" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "underline" }}>
            Back to tracker
          </Link>
        </div>
      </div>
    </div>
  );
}
