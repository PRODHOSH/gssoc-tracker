import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const BASE_URL = "https://gssoc-tracker.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "GSSoC PR Tracker — Track GSSoC 2026 Contributions, Points & Rankings",
    template: "%s | GSSoC PR Tracker",
  },
  description:
    "The unofficial community tracker for GirlScript Summer of Code 2026. Track contributor PR points, mentor review scores, and project leaderboards. Search any GitHub username to see live GSSoC stats. Built by PRODHOSH.",
  keywords: [
    "GSSoC 2026",
    "GSSoC tracker",
    "GSSoC PR tracker",
    "GSSoC points tracker",
    "GirlScript Summer of Code 2026",
    "GirlScript Summer of Code tracker",
    "GSSoC leaderboard",
    "GSSoC contributor points",
    "GSSoC mentor tracker",
    "GSSoC points calculator",
    "check GSSoC score",
    "GSSoC 2026 contribution tracker",
    "GSSoC PR validator",
    "GSSoC approved PRs",
    "gssoc:approved label",
    "GSSoC PR check",
    "does my PR count GSSoC",
    "GSSoC ranking 2026",
    "open source contribution tracker",
    "GitHub PR tracker GSSoC",
  ],
  authors: [{ name: "PRODHOSH", url: "https://github.com/PRODHOSH" }],
  creator: "PRODHOSH",
  publisher: "PRODHOSH",
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "GSSoC PR Tracker",
    title: "GSSoC PR Tracker — Track GSSoC 2026 Contributions & Points",
    description:
      "Track your GSSoC 2026 open-source journey. Search any GitHub username to see contributor points, mentor scores, merged PRs, and live rankings.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "GSSoC PR Tracker — community contribution tracker for GSSoC 2026",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@prodhosh",
    creator: "@prodhosh",
    title: "GSSoC PR Tracker — GSSoC 2026 Contributions & Rankings",
    description:
      "Track contributor points, mentor review scores, and repo leaderboards for GirlScript Summer of Code 2026.",
    images: ["/opengraph-image.png"],
  },
  alternates: {
    canonical: BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "UaoSRKAHIpDzT6sD0-yziuiyGSNpEyp9RaDEA009Vcs",
  },
  other: {
    // Bing Webmaster verification — replace with your code from bing.com/webmasters
    "msvalidate.01": "REPLACE_WITH_BING_CODE",
  },
  category: "technology",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${BASE_URL}/#webapp`,
        name: "GSSoC PR Tracker",
        url: BASE_URL,
        description:
          "Unofficial community tracker for GirlScript Summer of Code 2026. Track contributor PR points, mentor review scores, and project leaderboards.",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        author: {
          "@type": "Person",
          name: "PRODHOSH",
          url: "https://github.com/PRODHOSH",
        },
        inLanguage: "en",
      },
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: BASE_URL,
        name: "GSSoC PR Tracker",
        description: "Track GSSoC 2026 contributions, points, and rankings.",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${BASE_URL}/pr-tracker/{search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${BASE_URL}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "How are GSSoC 2026 points calculated?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "GSSoC 2026 points are calculated as: 50 base points + (difficulty score × quality multiplier) + type bonuses. Difficulty labels set the base (level:beginner=20, level:intermediate=35, level:advanced=55, level:critical=80). Quality labels apply a multiplier (quality:clean=×1.2, quality:exceptional=×1.5). Type labels add bonuses from 5 to 20 points. Only merged PRs with the gssoc:approved label count.",
            },
          },
          {
            "@type": "Question",
            name: "What is the gssoc:approved label?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The gssoc:approved label is applied by GSSoC mentors to PRs that meet the quality bar for GSSoC 2026. Without this label, a PR scores 0 points regardless of other labels. It is the primary requirement for a PR to count toward your GSSoC score.",
            },
          },
          {
            "@type": "Question",
            name: "How do I check my GSSoC 2026 score?",
            acceptedAnswer: {
              "@type": "Answer",
              text: `Go to ${BASE_URL}, select Contributor, enter your GitHub username, and see your full GSSoC 2026 score — including a breakdown of every approved PR, difficulty levels, quality multipliers, and type bonuses.`,
            },
          },
          {
            "@type": "Question",
            name: "Does my PR count for GSSoC 2026?",
            acceptedAnswer: {
              "@type": "Answer",
              text: `A PR counts for GSSoC 2026 if it: (1) has the gssoc:approved label from a mentor, (2) is merged, (3) is in an officially registered GSSoC 2026 project repo, and (4) does not have any invalid flags (gssoc:invalid, gssoc:spam, gssoc:ai-slop). Use the PR Validator at ${BASE_URL}/pr-check to check any specific PR instantly.`,
            },
          },
          {
            "@type": "Question",
            name: "What is GSSoC PR Tracker?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "GSSoC PR Tracker is an unofficial community tool that lets GirlScript Summer of Code 2026 contributors and mentors track their contributions, scores, and rankings in real time. It fetches data from the GitHub API and filters to officially registered GSSoC 2026 projects.",
            },
          },
          {
            "@type": "Question",
            name: "How do I validate a GSSoC pull request?",
            acceptedAnswer: {
              "@type": "Answer",
              text: `Go to ${BASE_URL}/pr-check, paste the GitHub PR link, and get an instant verdict. The PR Validator checks the gssoc:approved label, merge status, whether the repo is officially registered, and any disqualifying flags — then shows the exact points breakdown.`,
            },
          },
        ],
      },
    ],
  };

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://api.github.com" />
      </head>
      <body className="min-h-screen">
        {children}
        <Analytics />
        <Script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CLKFW028BD"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-CLKFW028BD');
        `}</Script>
      </body>
    </html>
  );
}
