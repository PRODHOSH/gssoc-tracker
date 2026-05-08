#!/usr/bin/env tsx
/**
 * Quick email test — run locally to verify SMTP config.
 *
 *   npx tsx scripts/test-email.ts
 *
 * Reads .env.local automatically. Sends a sample change-alert + digest
 * to your NOTIFY_EMAIL so you can see exactly what arrives in your inbox.
 */

import path from "path";
import fs   from "fs";

// Load .env.local before anything else
const envFile = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf-8").split("\n")) {
    const [k, ...v] = line.split("=");
    if (k?.trim() && !k.startsWith("#")) {
      process.env[k.trim()] = v.join("=").trim().replace(/^["']|["']$/g, "");
    }
  }
}

import nodemailer from "nodemailer";
import { buildChangeAlertHTML, buildDailyDigestHTML } from "./email-templates";

const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const to   = process.env.NOTIFY_EMAIL ?? user;

if (!user || !pass || !to) {
  console.error("❌  Missing env vars. Make sure .env.local has SMTP_USER, SMTP_PASS, NOTIFY_EMAIL");
  process.exit(1);
}

const SAMPLE_PROFILE = {
  name:          "Prodhosh VS",
  github_id:     "PRODHOSH",
  avatar_url:    "https://avatars.githubusercontent.com/PRODHOSH",
  rank:          10,
  score:         1020,
  role_scores:   { ambassador: 935, contributor: 110 } as Record<string, number>,
  college:       "VIT Chennai",
  city:          "Chennai, India",
  accepted_roles: ["ambassador", "contributor"],
  tracks:        ["Open Source Track", "AI / Agents Track"],
  breakdown: [
    { label: "ambassador (accepted)", pts: 70,  role: "ambassador" },
    { label: "contributor (accepted)", pts: 50, role: "contributor" },
    { label: "GitHub profile",          pts: 10, role: "general"     },
    { label: "Bio filled",              pts: 5,  role: "general"     },
    { label: "LinkedIn profile",        pts: 5,  role: "general"     },
    { label: "Discord linked",          pts: 5,  role: "general"     },
    { label: "Both tracks selected",    pts: 35, role: "contributor" },
    { label: "Social links",            pts: 20, role: "ambassador"  },
    { label: "Reach plan",              pts: 15, role: "ambassador"  },
    { label: "Promotion plan",          pts: 10, role: "ambassador"  },
    { label: "Past events",             pts: 15, role: "ambassador"  },
    { label: "52 referral(s)",          pts: 780,role: "ambassador"  },
  ],
  timestamp: new Date().toISOString(),
};

const PREV = { rank: 12, score: 990, role_scores: { ambassador: 905, contributor: 110 } as Record<string, number> };

async function main() {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  console.log(`📧 Sending test emails to: ${to}`);
  console.log(`   From: ${user}`);

  // ── 1. Change alert
  await transporter.sendMail({
    from:    `"GSSoC Tracker 🏆" <${user}>`,
    to,
    subject: `[TEST] GSSoC Alert: Score +30 pts · Rank #10`,
    html:    buildChangeAlertHTML({ curr: SAMPLE_PROFILE, prev: PREV }),
  });
  console.log("✅  Change alert sent");

  // ── 2. Daily digest
  await transporter.sendMail({
    from:    `"GSSoC Tracker 🏆" <${user}>`,
    to,
    subject: `[TEST] GSSoC Daily: Score 1,020 pts · Rank #10`,
    html:    buildDailyDigestHTML({
      profile:       SAMPLE_PROFILE,
      history_count: 7,
      score_7d:      +30,
      rank_7d:       -2,
    }),
  });
  console.log("✅  Daily digest sent");

  console.log("\n🎉  Both test emails sent! Check your inbox.");
}

main().catch(e => { console.error("❌", e.message); process.exit(1); });
