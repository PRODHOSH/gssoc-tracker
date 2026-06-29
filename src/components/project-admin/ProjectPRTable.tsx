"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import { ExternalLink, ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";
import { ds, fontMono } from "@/lib/ds";
import { getLabelChipColors } from "@/lib/labelColors";
import type { ProjectAdminPR } from "@/lib/project-admin-tracker";

function LabelChip({ name, color }: { name: string; color?: string }) {
  const c = getLabelChipColors(name, color);
  return (
    <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: ds.rFull, fontSize: 11, fontWeight: 500, background: c.bg, border: `1px solid ${c.border}`, color: c.color, whiteSpace: "nowrap" }}>
      {name}
    </span>
  );
}

type SortKey = "points" | "createdAt" | "title" | "author";

function SortBtn({ col, active, dir, onToggle, children }: {
  col: SortKey; active: SortKey; dir: "asc" | "desc";
  onToggle: (col: SortKey) => void; children: React.ReactNode;
}) {
  const isActive = active === col;
  const Icon = isActive ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <button
      onClick={() => onToggle(col)}
      style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 12, fontWeight: 600, color: isActive ? ds.primaryDeep : ds.inkMute, textTransform: "uppercase", letterSpacing: "0.04em" }}
    >
      {children} <Icon size={11} />
    </button>
  );
}

export function ProjectPRTable({ prs }: { prs: ProjectAdminPR[] }) {
  const [query, setQuery]     = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage]       = useState(1);
  const PER_PAGE = 15;

  function toggleSort(col: SortKey) {
    if (sortKey === col) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(col); setSortDir("desc"); }
    setPage(1);
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return prs.filter((pr) =>
      !q || pr.title.toLowerCase().includes(q) || pr.author.toLowerCase().includes(q)
    );
  }, [prs, query]);

  const sorted = useMemo(() => {
    const mult = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "points")    return mult * (a.points - b.points);
      if (sortKey === "createdAt") return mult * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      if (sortKey === "title")     return mult * a.title.localeCompare(b.title);
      if (sortKey === "author")    return mult * a.author.localeCompare(b.author);
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const pageData   = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div style={{ background: ds.canvas, border: `1px solid ${ds.hairlineCool}`, borderRadius: ds.rLg, boxShadow: "0 1px 3px rgba(23,23,23,0.03)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${ds.hairlineCool}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: ds.ink }}>
          Pull Requests <span style={{ fontWeight: 400, color: ds.inkMute, fontSize: 13 }}>({filtered.length})</span>
        </span>
        <div style={{ position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: ds.inkFaint, pointerEvents: "none" }} />
          <input
            type="text" value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search PRs or authors…"
            style={{ height: 32, paddingLeft: 28, paddingRight: 10, borderRadius: ds.rSm, border: `1px solid ${ds.hairline}`, background: ds.canvasSoft, fontSize: 13, color: ds.ink, outline: "none", width: 200 }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: ds.canvasSoft, borderBottom: `1px solid ${ds.hairlineCool}` }}>
              {([
                ["author",    "Author"],
                ["title",     "PR Title"],
                [null,        "Labels"],
                ["points",    "Points"],
                ["createdAt", "Date"],
                [null,        ""],
              ] as [SortKey | null, string][]).map(([key, label], i) => (
                <th key={i} style={{ padding: "9px 12px", textAlign: "left", whiteSpace: "nowrap", borderRight: i < 5 ? `1px solid ${ds.hairlineCool}` : "none" }}>
                  {key ? (
                    <SortBtn col={key} active={sortKey} dir={sortDir} onToggle={toggleSort}>{label}</SortBtn>
                  ) : (
                    <span style={{ fontSize: 12, fontWeight: 600, color: ds.inkMute, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 32, textAlign: "center", color: ds.inkFaint, fontSize: 13 }}>
                  {query ? "No PRs match your search" : "No PRs found"}
                </td>
              </tr>
            ) : (
              pageData.map((pr, i) => (
                <tr key={pr.id} style={{ borderBottom: i < pageData.length - 1 ? `1px solid ${ds.hairlineCool}` : "none" }}>
                  {/* Author */}
                  <td style={{ padding: "10px 12px", borderRight: `1px solid ${ds.hairlineCool}`, whiteSpace: "nowrap" }}>
                    <a href={pr.authorUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, textDecoration: "none" }}>
                      <Image src={pr.authorAvatar} alt={pr.author} width={22} height={22} unoptimized style={{ borderRadius: "50%", display: "block", flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: ds.inkMute, fontFamily: fontMono }}>{pr.author}</span>
                    </a>
                  </td>

                  {/* Title */}
                  <td style={{ padding: "10px 12px", borderRight: `1px solid ${ds.hairlineCool}`, maxWidth: 300 }}>
                    <span style={{ fontSize: 13, color: ds.ink, fontWeight: 500, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {pr.title}
                    </span>
                    <span style={{ fontSize: 11, color: pr.state === "merged" ? ds.primaryDeep : pr.state === "open" ? "#f59e0b" : ds.inkFaint }}>
                      {pr.state}
                    </span>
                  </td>

                  {/* Labels */}
                  <td style={{ padding: "10px 12px", borderRight: `1px solid ${ds.hairlineCool}` }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 3, minWidth: 100 }}>
                      {pr.labels.map((l) => <LabelChip key={l} name={l} color={pr.labelColors[l]} />)}
                    </div>
                  </td>

                  {/* Points */}
                  <td style={{ padding: "10px 12px", borderRight: `1px solid ${ds.hairlineCool}`, whiteSpace: "nowrap", textAlign: "right" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, fontFamily: fontMono, color: pr.points > 0 ? ds.primaryDeep : ds.inkFaint }}>
                      {pr.points > 0 ? pr.points : "—"}
                    </span>
                  </td>

                  {/* Date */}
                  <td style={{ padding: "10px 12px", borderRight: `1px solid ${ds.hairlineCool}`, whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: 12, color: ds.inkMute2 }}>
                      {new Date(pr.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                    </span>
                  </td>

                  {/* Link */}
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <a href={pr.url} target="_blank" rel="noopener noreferrer" style={{ color: ds.inkMute2, display: "inline-flex" }}>
                      <ExternalLink size={13} />
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (() => {
        // Build a truncated page window: [1, ..., current-1, current, current+1, ..., last]
        const pages: (number | "...")[] = [];
        if (totalPages <= 7) {
          for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          if (page > 3) pages.push("...");
          for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
          if (page < totalPages - 2) pages.push("...");
          pages.push(totalPages);
        }

        const btnBase = { height: 28, borderRadius: ds.rSm, fontSize: 12, cursor: "pointer", border: `1px solid ${ds.hairline}`, background: "transparent", color: ds.inkMute } as const;

        return (
          <div style={{ padding: "12px 18px", borderTop: `1px solid ${ds.hairlineCool}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: ds.inkMute2 }}>Page {page} of {totalPages}</span>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ ...btnBase, padding: "0 8px", opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? "default" : "pointer" }}>
                ←
              </button>
              {pages.map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} style={{ width: 28, textAlign: "center", fontSize: 12, color: ds.inkFaint }}>…</span>
                ) : (
                  <button key={p} onClick={() => setPage(p)} style={{ ...btnBase, width: 28, border: `1px solid ${page === p ? ds.primary : ds.hairline}`, background: page === p ? "rgba(62,207,142,0.08)" : "transparent", color: page === p ? ds.primaryDeep : ds.inkMute, fontWeight: page === p ? 600 : 400 }}>
                    {p}
                  </button>
                )
              )}
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)} style={{ ...btnBase, padding: "0 8px", opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? "default" : "pointer" }}>
                →
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
