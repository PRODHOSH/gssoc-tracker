"use client";
import Image from "next/image";
import Link from "next/link";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import { Mail } from "lucide-react";
import { ds, fontMono } from "@/lib/ds";

const OWNER = {
  name:     "Prodhosh VS",
  handle:   "PRODHOSH",
  avatar:   "https://avatars.githubusercontent.com/PRODHOSH",
  github:   "https://github.com/PRODHOSH",
  linkedin: "https://www.linkedin.com/in/prodhoshvs",
  email:    "mailto:prodhoshvs@gmail.com",
  college:  "VIT Chennai",
};

const NAV_GROUPS = [
  {
    label: "Product",
    links: [
      { label: "Features",     href: "#features"    },
      { label: "How it Works", href: "#how-it-works" },
      { label: "Scoring",      href: "#scoring"      },
    ],
  },
  {
    label: "Resources",
    links: [
      { label: "GSSoC Official",  href: "https://gssoc.girlscript.org",             ext: true },
      { label: "Leaderboard",     href: "https://gssoc.girlscript.org/leaderboard", ext: true },
      { label: "GitHub Repo",     href: OWNER.github,                               ext: true },
    ],
  },
];

export function Footer() {
  return (
    <footer style={{ background: ds.canvasNight, padding: "64px 24px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Top grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.6fr repeat(2, 1fr) 1.2fr",
          gap: 48,
          marginBottom: 56,
        }}>

          {/* Brand column */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect width="20" height="20" rx="5" fill={ds.primary} />
                <path d="M6 10h8M10 6v8" stroke="#1c1c1c" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: 15, fontWeight: 700, color: ds.onDark, letterSpacing: "-0.02em" }}>GSSoC Tracker</span>
            </div>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: 240 }}>
              Personal analytics dashboard for GirlScript Summer of Code 2026 participants.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { href: OWNER.github,   icon: <GitHubIcon width={15} height={15} />,   label: "GitHub"   },
                { href: OWNER.linkedin, icon: <LinkedInIcon width={15} height={15} />, label: "LinkedIn" },
                { href: OWNER.email,    icon: <Mail size={15} />,                       label: "Email"    },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  title={s.label}
                  style={{
                    width: 34, height: 34, borderRadius: 8,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.45)",
                    transition: "all 0.13s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = ds.onDark; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav groups */}
          {NAV_GROUPS.map(g => (
            <div key={g.label}>
              <p style={{
                margin: "0 0 16px", fontSize: 11, fontWeight: 700,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}>
                {g.label}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {g.links.map(l => (
                  <a key={l.label}
                    href={l.href}
                    target={(l as { ext?: boolean }).ext ? "_blank" : undefined}
                    rel={(l as { ext?: boolean }).ext ? "noopener noreferrer" : undefined}
                    style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none", transition: "color 0.13s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = ds.onDark)}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          ))}

          {/* Built by */}
          <div>
            <p style={{
              margin: "0 0 16px", fontSize: 11, fontWeight: 700,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              Built by
            </p>
            <Link href={`/dashboard/${OWNER.handle}`} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              textDecoration: "none",
              marginBottom: 10,
              transition: "border-color 0.13s",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = `rgba(62,207,142,0.3)`)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            >
              <Image
                src={OWNER.avatar} alt={OWNER.name}
                width={36} height={36}
                style={{ borderRadius: "50%", border: "2px solid rgba(62,207,142,0.3)", flexShrink: 0 }}
                unoptimized
              />
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: ds.onDark, whiteSpace: "nowrap" }}>{OWNER.name}</p>
                <p style={{ margin: "1px 0 0", fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: fontMono }}>@{OWNER.handle}</p>
              </div>
            </Link>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.25)", lineHeight: 1.5 }}>
              {OWNER.college} · GSSoC &apos;26<br />Ambassador + Contributor
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: 24,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
        }}>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
            © 2026 GSSoC Tracker · Community tool, not affiliated with GirlScript Foundation
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
            Data from{" "}
            <a href="https://gssoc.girlscript.org" target="_blank" rel="noopener noreferrer"
              style={{ color: "rgba(255,255,255,0.35)", textDecoration: "underline" }}>
              gssoc.girlscript.org
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
