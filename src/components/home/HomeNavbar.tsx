import React from "react";
import Link from "next/link";
import { Star, Bell } from "lucide-react";
import Image from "next/image";

export interface HomeNavbarProps {}

export function HomeNavbar({}: Readonly<HomeNavbarProps>) {
  return (
    <nav className="bg-canvas-night/40 backdrop-blur-md border-b border-white/10 w-full h-16 sticky top-0 z-50">
      <div className="flex justify-between items-center px-6 md:px-12 w-full h-full">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-display text-2xl tracking-tighter text-primary">
            GSSoC Tracker
          </Link>
          <div className="hidden md:flex font-mono text-[10px] font-bold uppercase tracking-widest">
            <Link href="/terms" className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/5 border border-primary/10 text-primary/80 hover:text-primary hover:bg-primary/10 transition-colors">
              Point System
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="https://github.com/PRODHOSH"
            target="_blank"
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/5 border border-primary/10 text-primary/80 hover:text-primary hover:bg-primary/10 transition-colors font-mono text-[10px] font-bold uppercase tracking-widest"
          >
            <Image src="https://avatars.githubusercontent.com/u/108008064?v=4" alt="PRODHOSH" width={16} height={16} className="rounded-full grayscale hover:grayscale-0 transition-all" />
            <span>Built by @PRODHOSH</span>
          </Link>
          <Link
            href="https://github.com/PRODHOSH/gssoc-tracker"
            target="_blank"
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/5 border border-primary/10 text-primary/80 hover:text-primary hover:bg-primary/10 transition-colors font-mono text-[10px] font-bold uppercase tracking-widest"
          >
            <Star size={14} />
            <span>Star</span>
          </Link>
          <button
            className="font-mono text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 active:translate-y-px transition-all rounded-md flex items-center gap-2"
          >
            <Bell size={12} />
            Get alerts
          </button>
        </div>
      </div>
    </nav>
  );
}
