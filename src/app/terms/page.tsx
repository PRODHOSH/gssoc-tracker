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
            "We check our Supabase database to see if we already have your pull requests",
            "If it has been more than 1 minute since your last check, we ask GitHub for any new or updated PRs",
            "We save that new data to our database so the app stays lightning fast and avoids GitHub rate limits",
            "The GSSoC labels on each PR are read (gssoc:approved, level:*, quality:*, type:*, etc.)",
            "Points are calculated using the GSSoC 2026 scoring formula",
            "Charts and stats are generated and shown to you",
          ]} />
          <P>
            Because we use a smart 1 minute delta sync, your updates appear almost instantly while keeping the site completely crash proof during huge traffic spikes.
          </P>
        </Section>

        {/* Section 2 */}
        <Section icon={<AlertTriangle size={15} color="#fbbf24" />} title="How this aligns with the official tracker">
          <Note>
            <strong>We now filter to the 421 officially registered GSSoC 2026 projects.</strong> Your score here reflects only PRs in repos on that list — the same set the official leaderboard uses.
          </Note>
          <P>
            We fetch the project list directly from <Bright>gssoc.girlscript.org/api/projects</Bright> and check every PR against it. If a repo is not on the list, we still show the PR in your tracker list so you aren't confused about where it went, but we explicitly mark it as <strong>Disqualified (0 points)</strong> so it does not falsely inflate your score.
          </P>
          <P>
            The <Hi>PR Validator</Hi> at <Bright>/pr-check</Bright> lets you paste any PR link and see exactly which category it falls into — valid, unofficial, not approved, and so on. It also shows the full points breakdown for that specific PR.
          </P>
          <P>
            One thing to keep in mind: the official list is updated as new projects get approved during the programme. We refresh our local copy periodically. If a repo was added recently and your PR is not showing up, try again in a day or two.
          </P>
        </Section>

        {/* Section 3 */}
        <Section icon={<Shield size={15} color={ds.primary} />} title="Data and privacy">
          <P>We keep this simple because there is genuinely not much to say.</P>

          <P><Bright>What we do not do:</Bright></P>
          <Bullets items={[
            "No accounts, no sign-up, no passwords",
            "No selling, sharing, or monetising of any data",
          ]} />

          <P><Bright>GitHub API & Supabase Storage:</Bright> To fetch your contributions, we query the public GitHub API. To make the tracker lightning fast and prevent GitHub from blocking us due to rate limits, we store a copy of your public GSSoC pull requests in a Supabase database. This data is strictly the public information already visible on GitHub (PR titles, labels, links, and merge times). We do not have access to your private repos or code. This data is used solely to generate the statistics you see on your dashboard, including total points, merged PRs, active streak, and contributor rank.</P>

          <P><Bright>Analytics & Crash Tracking:</Bright> We use Google Analytics, Vercel Analytics, and PostHog to track page views, monitor app stability, and understand how the site is used. Our site is also monitored via Google Search Console. To help us fix UI bugs and crashes quickly, PostHog safely records anonymous video replays of your sessions. These recordings only capture how you interact with the UI so we can see exactly what broke. No personally identifiable information or private repository data is tracked or recorded.</P>

          <P><Bright>Email alerts (optional):</Bright> If you subscribe to PR alerts, your GitHub username and email address are saved in a file inside this project's GitHub repository. That is literally where the data lives, a plain file in the repo, nothing fancier. It is only used to send you alerts and nothing else. You can remove yourself any time using the unsubscribe link in any alert email, and your entry gets deleted from that file immediately. We do not share it with anyone.</P>

          <P><Bright>Feedback (optional):</Bright> If you submit a rating or comment through the feedback widget, your response is submitted anonymously to a Google Form. No name, email, or identifying information is collected. A flag is saved in your browser's local storage so the prompt does not appear again on the same device, this data never leaves your browser.</P>

          <P>Questions about privacy? Email{" "}
            <a href="mailto:prodhoshlaptop@gmail.com" style={{ color: ds.primary, textDecoration: "underline" }}>prodhoshlaptop@gmail.com</a>.
          </P>
        </Section>

        {/* Section 3b — PR Validator */}
        <Section icon={<Shield size={15} color={ds.primary} />} title="PR Validator">
          <P>
            The <Hi>PR Validator</Hi> at <Bright>/pr-check</Bright> lets anyone paste a GitHub PR link and instantly see whether it qualifies for GSSoC 2026 points. It checks the gssoc:approved label, merge status, and whether the repo is in the official project list, then shows the exact points breakdown.
          </P>
          <P>
            No data from this check is stored. The PR is fetched live from the GitHub API, analysed, and the result is shown only to you.
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
