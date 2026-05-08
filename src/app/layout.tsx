import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GSSoC 2026 Leaderboard — Community Edition",
  description:
    "Fast community leaderboard for GirlScript Summer of Code 2026. Search, filter, and explore 19,000+ contributors.",
  keywords: ["GSSoC", "GirlScript", "Open Source", "Leaderboard", "2026"],
  openGraph: {
    title: "GSSoC 2026 Leaderboard",
    description: "Fast community leaderboard for GSSoC 2026",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
