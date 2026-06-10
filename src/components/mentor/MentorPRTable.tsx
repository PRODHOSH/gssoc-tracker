"use client";
import { useState, useMemo } from "react";
import { ExternalLink, ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";
import { ds, fontMono } from "@/lib/ds";
import { getLabelChipColors } from "@/lib/labelColors";
import type { MentorPR } from "@/lib/mentor-tracker";

/* ── Pagination helper ───────────────────────────────────────── */
function pageItems(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | null)[] = [1];
  if (current > 3) items.push(null);
  for (let p = Math.max(2, current - 2); p <= Math.min(total - 1, current + 2); p++) items.push(p);
  if (current < total - 2) items.push(null);
  items.push(total);
  return items;
}

/* ── Label chip ─────────────────────────────────────────────── */
function LabelChip({ name, color }: { name: string; color?: string }) {
  const c = getLabelChipColors(name, color);
  return (
    <span style={{
      display: "inline-block", padding: "1px 7px", borderRadius: ds.rFull,
      fontSize: 11, fontWeight: 500,
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      whiteSpace: "nowrap",
    }}>
      {name}
    </span>
  );
}

type SortKey = "points" | "mergedAt" | "title" | "repo";

function SortBtn({ col, active, dir, onToggle, children }: {
  col: SortKey; active: SortKey; dir: "asc" | "desc";
  onToggle: (col: SortKey) => void; children: React.ReactNode;
}) {
  const isActive = active === col;
  const Icon = isActive ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <button
      onClick={() => onToggle(col)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        background: "none", border: "none", cursor: "pointer", padding: 0,
        fontSize: 12, fontWeight: 600,
        color: isActive ? ds.primaryDeep : ds.inkMute,
        textTransform: "uppercase", letterSpacing: "0.04em",
      }}
    >
      {children} <Icon size={11} />
    </button>
  );
}

export function MentorPRTable({ prs }: { prs: MentorPR[] }) {
  const [query, setQuery]     = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("mergedAt");
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
      !q || pr.title.toLowerCase().includes(q) || pr.repo.toLowerCase().includes(q)
    );
  }, [prs, query]);

  const sorted = useMemo(() => {
    const mult = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "points")   return mult * (a.points - b.points);
      if (sortKey === "mergedAt") return mult * (new Date(a.mergedAt ?? 0).getTime() - new Date(b.mergedAt ?? 0).getTime());
      if (sortKey === "title")    return mult * a.title.localeCompare(b.title);
      if (sortKey === "repo")     return mult * a.repo.localeCompare(b.repo);
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const pageData   = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div style={{
      background: ds.canvas, border: `1px solid ${ds.hairlineCool}`,
      borderRadius: ds.rLg, boxShadow: "0 1px 3px rgba(23,23,23,0.03)", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 18px", borderBottom: `1px solid ${ds.hairlineCool}`,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: ds.ink }}>
          Reviewed PRs <span style={{ fontWeight: 400, color: ds.inkMute, fontSize: 13 }}>({filtered.length})</span>
        </span>
        <div style={{ position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: ds.inkFaint, pointerEvents: "none" }} />
          <input
            type="text" value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search PRs…"
            style={{
              height: 32, paddingLeft: 28, paddingRight: 10, borderRadius: ds.rSm,
              border: `1px solid ${ds.hairline}`, background: ds.canvasSoft,
              fontSize: 13, color: ds.ink, outline: "none", width: 180,
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: ds.canvasSoft, borderBottom: `1px solid ${ds.hairlineCool}` }}>
              {([
                ["title",     "PR Title"],
                ["repo",      "Repository"],
                [null,        "Labels"],
                [null,        "Level"],
                [null,        "Quality Bonus"],
                ["points",   "Points"],
                ["mergedAt", "Merged"],
                [null,        ""],
              ] as [SortKey | null, string][]).map(([key, label], i) => (
                <th key={i} style={{
                  padding: "9px 12px", textAlign: "left", whiteSpace: "nowrap",
                  borderRight: i < 7 ? `1px solid ${ds.hairlineCool}` : "none",
                }}>
                  {key ? (
                    <SortBtn col={key} active={sortKey} dir={sortDir} onToggle={toggleSort}>{label}</SortBtn>
                  ) : (
                    <span style={{ fontSize: 12, fontWeight: 600, color: ds.inkMute, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {label}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 32, textAlign: "center", color: ds.inkFaint, fontSize: 13 }}>
                  {query ? "No PRs match your search" : "No PRs found"}
                </td>
              </tr>
            ) : (
              pageData.map((pr, i) => (
                <tr key={pr.id} style={{ borderBottom: i < pageData.length - 1 ? `1px solid ${ds.hairlineCool}` : "none" }}>
                  {/* Title */}
                  <td style={{ padding: "10px 12px", borderRight: `1px solid ${ds.hairlineCool}`, maxWidth: 260 }}>
                    <span style={{ fontSize: 13, color: ds.ink, fontWeight: 500, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {pr.title}
                    </span>
                    <span style={{ fontSize: 11, color: pr.state === "merged" ? ds.primaryDeep : pr.state === "open" ? "#f59e0b" : ds.inkFaint }}>
                      {pr.state}
                    </span>
                  </td>

                  {/* Repo */}
                  <td style={{ padding: "10px 12px", borderRight: `1px solid ${ds.hairlineCool}` }}>
                    <a href={pr.repoUrl} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, color: ds.inkMute, textDecoration: "none", fontFamily: fontMono, whiteSpace: "nowrap", display: "block", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {pr.repo}
                    </a>
                  </td>

                  {/* Labels */}
                  <td style={{ padding: "10px 12px", borderRight: `1px solid ${ds.hairlineCool}` }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 3, minWidth: 100 }}>
                      {pr.labels.map((l) => <LabelChip key={l} name={l} color={pr.labelColors[l]} />)}
                    </div>
                  </td>

                  {/* Level */}
                  <td style={{ padding: "10px 12px", borderRight: `1px solid ${ds.hairlineCool}`, whiteSpace: "nowrap" }}>
                    {pr.levelLabel ? (
                      <span style={{ fontSize: 12, color: ds.inkMute }}>
                        {pr.levelLabel.replace("level:", "")}
                        <span style={{ color: ds.inkFaint, fontFamily: fontMono }}> {pr.levelScore}pts</span>
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: ds.inkFaint }}>—</span>
                    )}
                  </td>

                  {/* Quality bonus */}
                  <td style={{ padding: "10px 12px", borderRight: `1px solid ${ds.hairlineCool}`, whiteSpace: "nowrap" }}>
                    {pr.qualityBonus > 0 && pr.qualityLabel ? (
                      <span style={{ fontSize: 12, color: ds.inkMute }}>
                        {pr.qualityLabel.replace("quality:", "")}
                        <span style={{ color: "#ca8a04", fontFamily: fontMono }}> +{pr.qualityBonus}</span>
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: ds.inkFaint }}>—</span>
                    )}
                  </td>

                  {/* Points */}
                  <td style={{ padding: "10px 12px", borderRight: `1px solid ${ds.hairlineCool}`, whiteSpace: "nowrap", textAlign: "right" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, fontFamily: fontMono, color: "#ca8a04" }}>
                      {pr.points}
                    </span>
                  </td>

                  {/* Merged */}
                  <td style={{ padding: "10px 12px", borderRight: `1px solid ${ds.hairlineCool}`, whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: 12, color: ds.inkMute2 }}>
                      {pr.mergedAt
                        ? new Date(pr.mergedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })
                        : <span style={{ color: ds.inkFaint }}>—</span>}
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
      {totalPages > 1 && (
        <div style={{ padding: "12px 18px", borderTop: `1px solid ${ds.hairlineCool}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 12, color: ds.inkMute2 }}>Page {page} of {totalPages}</span>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} suppressHydrationWarning
              style={{ height: 28, padding: "0 10px", borderRadius: ds.rSm, border: `1px solid ${ds.hairline}`,
                background: "transparent", color: page === 1 ? ds.inkFaint : ds.inkMute,
                fontSize: 13, cursor: page === 1 ? "default" : "pointer" }}>‹</button>
            {pageItems(page, totalPages).map((p, i) =>
              p === null
                ? <span key={`e${i}`} style={{ fontSize: 12, color: ds.inkFaint, padding: "0 2px" }}>…</span>
                : <button key={p} onClick={() => setPage(p)} suppressHydrationWarning style={{
                    width: 28, height: 28, borderRadius: ds.rSm,
                    border: `1px solid ${page === p ? ds.primary : ds.hairline}`,
                    background: page === p ? "rgba(62,207,142,0.08)" : "transparent",
                    color: page === p ? ds.primaryDeep : ds.inkMute,
                    fontSize: 12, fontWeight: page === p ? 600 : 400, cursor: "pointer",
                  }}>{p}</button>
            )}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} suppressHydrationWarning
              style={{ height: 28, padding: "0 10px", borderRadius: ds.rSm, border: `1px solid ${ds.hairline}`,
                background: "transparent", color: page === totalPages ? ds.inkFaint : ds.inkMute,
                fontSize: 13, cursor: page === totalPages ? "default" : "pointer" }}>›</button>
          </div>
        </div>
      )}
    </div>
  );
}
