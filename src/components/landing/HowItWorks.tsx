"use client";
import { motion } from "framer-motion";
import { ds, fontMono } from "@/lib/ds";

const STEPS = [
  {
    n: "1",
    title: "Enter your GitHub username",
    desc: "Type any GSSoC 2026 participant's GitHub handle. We'll look them up from the official leaderboard API instantly.",
    detail: "Works for all 19,585+ participants",
  },
  {
    n: "2",
    title: "Get your live dashboard",
    desc: "See your total score, rank, role breakdown, tech stack, tracks, and a full point-by-point explanation of how you earned your score.",
    detail: "Data refreshed every 30 minutes",
  },
  {
    n: "3",
    title: "Set up automated tracking",
    desc: "Fork the repo, add your Gmail credentials as GitHub secrets, and GitHub Actions will sync your data every 6 hours and email you on any change.",
    detail: "Email alerts + daily digest at 8 AM IST",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" style={{ background: ds.canvas, padding: "96px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <div style={{ maxWidth: 560, marginBottom: 56 }}>
          <p style={{
            margin: "0 0 10px", fontSize: 12, fontWeight: 700,
            color: ds.primaryDeep, letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            How it works
          </p>
          <h2 style={{
            margin: "0 0 14px",
            fontSize: "clamp(26px, 3.5vw, 36px)", fontWeight: 700,
            color: ds.ink, letterSpacing: "-0.025em", lineHeight: 1.2,
          }}>
            Up and running in under a minute
          </h2>
          <p style={{ margin: 0, fontSize: 16, color: ds.inkMute, lineHeight: 1.65 }}>
            No sign-up required. Just type a GitHub username and go.
          </p>
        </div>

        <div style={{ position: "relative" }}>
          {/* Connector line */}
          <div style={{
            position: "absolute",
            top: 20, left: 19,
            width: 1,
            height: `calc(100% - 40px)`,
            background: `linear-gradient(to bottom, ${ds.primary}, ${ds.hairlineCool})`,
          }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {STEPS.map((step, i) => (
              <motion.div key={step.n}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                style={{ display: "flex", gap: 24, paddingBottom: i < STEPS.length - 1 ? 40 : 0 }}
              >
                {/* Step number */}
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                  background: i === 0 ? ds.primary : ds.canvas,
                  border: `2px solid ${i === 0 ? ds.primary : ds.hairline}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, fontFamily: fontMono,
                  color: i === 0 ? ds.onPrimary : ds.inkMute,
                  zIndex: 1,
                }}>
                  {step.n}
                </div>

                {/* Content */}
                <div style={{
                  flex: 1,
                  background: ds.canvasSoft,
                  border: `1px solid ${ds.hairlineCool}`,
                  borderRadius: 12,
                  padding: "20px 24px",
                }}>
                  <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600, color: ds.ink }}>{step.title}</p>
                  <p style={{ margin: "0 0 12px", fontSize: 14, color: ds.inkMute, lineHeight: 1.65 }}>{step.desc}</p>
                  <span style={{
                    display: "inline-block",
                    fontSize: 11, fontWeight: 600, color: ds.primaryDeep,
                    padding: "2px 10px", borderRadius: 99,
                    background: "rgba(36,180,126,0.08)",
                    border: "1px solid rgba(36,180,126,0.2)",
                  }}>
                    {step.detail}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
