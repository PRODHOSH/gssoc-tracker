"use client";
import { Navbar }         from "./Navbar";
import { Hero }           from "./Hero";
import { Features }       from "./Features";
import { HowItWorks }     from "./HowItWorks";
import { ScoringSection } from "./ScoringSection";
import { CTASection }     from "./CTASection";
import { Footer }         from "./Footer";
import { ds }             from "@/lib/ds";

export function LandingPage() {
  return (
    <div style={{ background: ds.canvasSoft, minHeight: "100vh" }}>
      <Navbar />
      <Hero />

      {/* Stats strip */}
      <div style={{
        background: ds.canvas,
        borderBottom: `1px solid ${ds.hairlineCool}`,
        padding: "20px 24px",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", flexWrap: "wrap",
          gap: "16px 48px", justifyContent: "center",
        }}>
          {[
            { val: "19,585+", label: "Participants tracked"        },
            { val: "4",       label: "Roles supported"             },
            { val: "6h",      label: "Sync interval"               },
            { val: "100%",    label: "Open source · MIT licensed"  },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: ds.primaryDeep, fontFamily: "var(--font-mono)" }}>
                {s.val}
              </span>
              <span style={{ fontSize: 13, color: ds.inkMute }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <Features />
      <HowItWorks />
      <ScoringSection />
      <CTASection />
      <Footer />
    </div>
  );
}
