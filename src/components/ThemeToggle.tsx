"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { ds } from "@/lib/ds";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ width: 32, height: 32, opacity: 0 }} />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: ds.rSm,
        background: "transparent",
        border: `1px solid ${ds.hairlineCool}`,
        color: ds.inkMute,
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      title="Toggle Theme"
      aria-label="Toggle Theme"
      onMouseEnter={(e) => {
        e.currentTarget.style.background = ds.canvasSoft;
        e.currentTarget.style.color = ds.ink;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = ds.inkMute;
      }}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
