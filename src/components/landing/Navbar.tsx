"use client";
import Link from "next/link";
import Image from "next/image";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import { Mail } from "lucide-react";
import { ds } from "@/lib/ds";

const LINKS = [
  { label: "Features",    href: "#features"   },
  { label: "How it works",href: "#how-it-works"},
  { label: "Scoring",     href: "#scoring"     },
];

const OWNER = {
  handle:   "PRODHOSH",
  avatar:   "https://avatars.githubusercontent.com/PRODHOSH",
  github:   "https://github.com/PRODHOSH",
  linkedin: "https://www.linkedin.com/in/prodhoshvs",
  email:    "mailto:prodhoshvs@gmail.com",
};

export function Navbar() {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: `1px solid ${ds.hairlineCool}`,
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "0 24px", height: 60,
        display: "flex", alignItems: "center", gap: 40,
      }}>
        {/* Brand */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect width="20" height="20" rx="5" fill={ds.primary} />
            <path d="M6 10h8M10 6v8" stroke={ds.onPrimary} strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 15, fontWeight: 700, color: ds.ink, letterSpacing: "-0.02em" }}>
            GSSoC Tracker
          </span>
        </Link>

        {/* Nav */}
        <nav style={{ display: "flex", gap: 2, flex: 1 }}>
          {LINKS.map(l => (
            <a key={l.href} href={l.href} style={{
              padding: "5px 12px", borderRadius: ds.rSm,
              fontSize: 13, fontWeight: 500, color: ds.inkMute,
              textDecoration: "none", transition: "color 0.13s, background 0.13s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = ds.ink; e.currentTarget.style.background = ds.canvasSoft; }}
            onMouseLeave={e => { e.currentTarget.style.color = ds.inkMute; e.currentTarget.style.background = "transparent"; }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Social icons */}
          {[
            { href: OWNER.github,   icon: <GitHubIcon width={16} height={16} />,   label: "GitHub"   },
            { href: OWNER.linkedin, icon: <LinkedInIcon width={16} height={16} />, label: "LinkedIn" },
            { href: OWNER.email,    icon: <Mail size={16} />,                       label: "Email"    },
          ].map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
              title={s.label}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 32, height: 32, borderRadius: ds.rSm,
                color: ds.inkMute, textDecoration: "none",
                transition: "color 0.13s, background 0.13s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = ds.ink; e.currentTarget.style.background = ds.canvasSoft; }}
              onMouseLeave={e => { e.currentTarget.style.color = ds.inkMute; e.currentTarget.style.background = "transparent"; }}
            >
              {s.icon}
            </a>
          ))}

          <div style={{ width: 1, height: 20, background: ds.hairline, margin: "0 4px" }} />

          {/* Owner chip */}
          <Link href={`/dashboard/${OWNER.handle}`} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "4px 10px 4px 4px",
            borderRadius: ds.rFull,
            border: `1px solid ${ds.hairline}`,
            textDecoration: "none",
            transition: "border-color 0.13s, box-shadow 0.13s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = ds.primary; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(62,207,142,0.1)`; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = ds.hairline; e.currentTarget.style.boxShadow = "none"; }}
          >
            <Image src={OWNER.avatar} alt={OWNER.handle} width={22} height={22}
              style={{ borderRadius: "50%", display: "block" }} unoptimized />
            <span style={{ fontSize: 12, fontWeight: 600, color: ds.inkMute }}>@{OWNER.handle}</span>
          </Link>

          {/* CTA */}
          <a href="#hero" style={{
            display: "inline-flex", alignItems: "center",
            padding: "7px 16px", borderRadius: ds.rSm,
            background: ds.ink, color: ds.onDark,
            fontSize: 13, fontWeight: 600, textDecoration: "none",
            transition: "background 0.13s",
            marginLeft: 4,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#333")}
          onMouseLeave={e => (e.currentTarget.style.background = ds.ink)}
          >
            Track progress →
          </a>
        </div>
      </div>
    </header>
  );
}
