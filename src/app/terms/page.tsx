import Link from "next/link";
import { ds, fontMono } from "@/lib/ds";
import { ArrowLeft, GitPullRequest, AlertTriangle, Shield, ExternalLink, Heart } from "lucide-react";
import { TermsFeedback } from "@/components/TermsFeedback";

export const metadata = {
  title: "Terms & Privacy · GSSoC PR Tracker",
  description: "How this tool works, what data it accesses, and why it is not affiliated with GirlScript Summer of Code.",
};

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
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
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: "0 0 12px", fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>
      {children}
    </p>
  );
}

function Hi({ children }: { children: React.ReactNode }) {
  return <span style={{ color: ds.primary, fontWeight: 600 }}>{children}</span>;
}

function Bright({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{children}</span>;
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      margin: "12px 0",
      padding: "12px 16px",
      borderRadius: 8,
      background: "rgba(251,191,36,0.06)",
      border: "1px solid rgba(251,191,36,0.2)",
      fontSize: 13,
      color: "rgba(251,191,36,0.85)",
      lineHeight: 1.7,
    }}>
      {children}
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: "0 0 12px", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item) => (
        <li key={item} style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>{item}</li>
      ))}
    </ul>
  );
}

export default function TermsPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: ds.canvasNight,
      fontFamily: "var(--font-sans)",
      padding: "0 24px 80px",
    }}>
      {/* Nav */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 0 0", display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.35)", textDecoration: "none", fontSize: 13, padding: "4px 8px", borderRadius: 6 }}>
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
            Straight answers about this tool
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
            No legal jargon. Just a plain explanation of what this tool does, what data it touches, and who made it.
          </p>
        </div>

        {/* Disclaimer banner */}
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
              <strong>This is NOT an official GSSoC tool.</strong> It has no connection with GirlScript Summer of Code, GirlScript Foundation, or any of their partners. GSSoC and GirlScript are trademarks of their respective owners.
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <Section icon={<GitPullRequest size={15} color={ds.primary} />} title="What this tool does">
          <P>
            GSSoC Tracker is a personal analytics tool built by a GSSoC 2026 participant. You enter a GitHub username and it shows you your contribution stats in a way the official leaderboard does not.
          </P>
          <P>Here is exactly what happens when you search a username:</P>
          <Bullets items={[
            "Your public pull requests are fetched from the GitHub API",
            "The GSSoC labels on each PR are read (gssoc:approved, level:*, quality:*, type:*, etc.)",
            "Points are calculated using the GSSoC 2026 scoring formula",
            "Charts and stats are generated and shown to you",
          ]} />
          <P>
            Results are <Bright>cached for up to 5 minutes</Bright> on Vercel&apos;s servers to reduce GitHub API load. After that window the data is gone. Nothing is stored long term, and nothing is sold.
          </P>
        </Section>

        {/* Section 2 */}
        <Section icon={<AlertTriangle size={15} color="#fbbf24" />} title="How this differs from the official tracker">
          <Note>
            <strong>The official GSSoC leaderboard only counts PRs merged into repos that are officially registered with GSSoC.</strong> This tool does not have that filter.
          </Note>
          <P>
            This tracker picks up <Bright>all public PRs</Bright> on your GitHub profile that carry GSSoC labels, whether or not the repo is officially listed in the programme. That means your score here <Hi>may be higher</Hi> than on the official leaderboard.
          </P>
          <P>
            Use this to understand your own activity and label patterns. For your official standing, always check the GSSoC leaderboard.
          </P>
        </Section>

        {/* Section 3 */}
        <Section icon={<Shield size={15} color={ds.primary} />} title="Data and privacy">
          <P>We keep this simple because there is genuinely not much to say.</P>

          <P><Bright>What we do not do:</Bright></P>
          <Bullets items={[
            "No accounts, no sign-up, no passwords",
            "No selling, sharing, or monetising of any data",
            "No tracking of which usernames you look up",
          ]} />

          <P><Bright>Google Analytics:</Bright> This site uses Google Analytics to understand how many people visit and which features they use. It collects anonymised, aggregated data like page views and session counts. No personal information is shared with us through it. You can read more in the{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: ds.primary, textDecoration: "underline" }}>Google Privacy Policy</a>.
          </P>

          <P><Bright>Email alerts (optional):</Bright> If you choose to subscribe to PR alerts, your email address is stored to send those notifications and for nothing else. You can remove it any time using the unsubscribe link in any alert email. We do not share your email with anyone.</P>

          <P><Bright>Feedback (optional):</Bright> If you submit a rating or comment through the feedback widget, your response is submitted anonymously to a Google Form. No name, email, or identifying information is collected. A flag is saved in your browser&apos;s local storage so the prompt does not appear again on the same device — this data never leaves your browser.</P>

          <P>The only external service called for tracker functionality is the GitHub REST API at api.github.com, which is subject to{" "}
            <a href="https://docs.github.com/en/site-policy/github-terms/github-terms-of-service" target="_blank" rel="noopener noreferrer" style={{ color: ds.primary, textDecoration: "underline" }}>GitHub&apos;s own terms</a>.
          </P>

          <P>
            Questions about privacy? Email{" "}
            <a href="mailto:prodhoshlaptop@gmail.com" style={{ color: ds.primary, textDecoration: "underline" }}>prodhoshlaptop@gmail.com</a>.
          </P>
        </Section>

        {/* Section 4 */}
        <Section icon={<ExternalLink size={15} color="rgba(255,255,255,0.6)" />} title="Why this was built">
          <P>
            The official GSSoC leaderboard takes a long time to load, and that makes sense. It is processing contributions across 45,000+ participants, filtering specifically to registered project repos, and doing that at scale. That is a hard problem and the delay is understandable.
          </P>
          <P>
            But as a contributor, I just wanted a fast personal view of my own PRs, with labels, charts, and a breakdown I could actually read. So I built it for myself.
          </P>
          <P>
            When I shared it with a few people, the response was clear: a lot of contributors were unsure whether their PRs had actually been accepted. They could not tell if a label had been applied, if their score had changed, or why two PRs with similar effort gave different points. This tool answers those questions directly.
          </P>
          <P>
            That is why I put it out for the community. It is not trying to replace the official tracker. It is a faster, more personal way to understand your own contributions.
          </P>
          <P>
            Source code is open on{" "}
            <a href="https://github.com/PRODHOSH/gssoc-tracker" target="_blank" rel="noopener noreferrer" style={{ color: ds.primary, textDecoration: "underline" }}>
              GitHub
            </a>. Issues and PRs are welcome.
          </P>
        </Section>

        {/* Section 5 */}
        <Section icon={<Heart size={15} color="#34d399" />} title="Free, forever, no catch">
          <P>
            This tool is <Bright>completely free</Bright> and makes <Bright>zero money</Bright>. No ads, no paid plans, no sponsorships. Hosting costs come out of the creator&apos;s own pocket.
          </P>
          <P>
            I am Prodhosh, a GSSoC 2026 participant and ambassador. This exists purely because I wanted it and figured others might too.
          </P>
          <Note>
            If you find it useful, a star on GitHub is more than enough. That is genuinely all the thanks needed.
          </Note>
        </Section>

        {/* Feedback */}
        <TermsFeedback />

        {/* Footer */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: 24,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 10,
        }}>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
            Last updated: June 2026
          </p>
          <Link href="/" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "underline" }}>
            Back to tracker
          </Link>
        </div>
      </div>
    </div>
  );
}
