"use client";
import { useState, useMemo } from "react";
import { ExternalLink, ArrowUpDown, ArrowUp, ArrowDown, Search, Download, AlertTriangle } from "lucide-react";
import { getLabelChipColors } from "@/lib/labelColors";
import type { TrackedPR } from "@/types/pr-tracker";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    <span 
      className="inline-block px-2 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-widest font-bold"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color }}
    >
      {name}
    </span>
  );
}

/* ── "Not counted" warning ──────────────────────────────────── */
function notCountedInfo(pr: TrackedPR): { label: string; tooltip: string } | null {
  if (!pr.isValid) {
    return {
      label: "Disqualified",
      tooltip: pr.disqualifiedReason || "This PR has a gssoc:invalid, gssoc:spam, or gssoc:ai-slop label, so it scores 0 points. Ask a mentor to remove that label if it was applied by mistake.",
    };
  }
  if (pr.state === "open") {
    return {
      label: "Pending merge",
      tooltip: `Not counted yet — these ${pr.points} pts will be added to your total automatically once this PR is merged.`,
    };
  }
  if (pr.state === "closed") {
    return {
      label: "Not merged",
      tooltip: `This PR was closed without merging, so its ${pr.points} pts don't count toward your total. Get the PR reopened and merged for it to count.`,
    };
  }
  return null;
}

function NotCountedBadge({ info }: { info: { label: string; tooltip: string } }) {
  return (
    <span 
      title={info.tooltip} 
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold cursor-help whitespace-nowrap"
    >
      <AlertTriangle size={10} /> {info.label}
    </span>
    <TooltipProvider delay={100}>
      <Tooltip>
        <TooltipTrigger>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold cursor-help">
            <AlertTriangle size={10} /> {info.label}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-center font-sans text-xs">
          {info.tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ── Export CSV ─────────────────────────────────────────────── */
function exportCSV(prs: TrackedPR[], username: string) {
  const header = ["Title", "Repo", "Difficulty", "Quality", "Type Bonuses", "Points", "Merged At", "URL"];
  const rows = prs.map((pr) => [
    `"${pr.title.replace(/"/g, '""')}"`,
    pr.repo,
    pr.difficulty ?? "-",
    pr.quality ?? "-",
    pr.typeBonuses.join(";"),
    pr.points,
    pr.mergedAt ? new Date(pr.mergedAt).toLocaleDateString() : "-",
    pr.url,
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gssoc-prs-${username}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Sort button ────────────────────────────────────────────── */
type SortKey = "points" | "mergedAt" | "title" | "repo";

function SortBtn({
  col,
  active,
  dir,
  onToggle,
  children,
}: {
  col: SortKey;
  active: SortKey;
  dir: "asc" | "desc";
  onToggle: (col: SortKey) => void;
  children: React.ReactNode;
}) {
  const isActive = active === col;
  const Icon = isActive ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <button
      onClick={() => onToggle(col)}
      className={`inline-flex items-center gap-1 bg-transparent border-none cursor-pointer p-0 font-mono text-[11px] font-bold uppercase tracking-widest ${isActive ? "text-primary" : "text-muted-steel"}`}
    >
      {children}
      <Icon size={11} />
    </button>
  );
}

/* ── Main component ─────────────────────────────────────────── */
interface Props {
  prs: TrackedPR[];
  username: string;
}

export function PRTable({ prs, username }: Props) {
  const [query, setQuery]   = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("mergedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage]     = useState(1);
  const PER_PAGE = 15;

  function toggleSort(col: SortKey) {
    if (sortKey === col) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(col);
      setSortDir("desc");
    }
    setPage(1);
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return prs.filter(
      (pr) =>
        !q ||
        pr.title.toLowerCase().includes(q) ||
        pr.repo.toLowerCase().includes(q) ||
        pr.labels.some((l) => l.includes(q))
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
  const pageData = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <section className="bg-pure-surface border border-whisper-border rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-16 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-whisper-border flex justify-between items-center bg-canvas-night/5">
        <h3 className="font-display text-xl font-bold text-ghost-white">
          Recent Contributions <span className="font-mono text-sm font-normal text-muted-steel">({filtered.length})</span>
        </h3>

        <div className="flex gap-2 items-center flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-steel pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search PRs…"
              className="h-8 pl-8 pr-3 rounded-md border border-whisper-border bg-transparent text-sm text-ghost-white outline-none w-48 focus:ring-1 focus:ring-primary focus:border-primary transition-all font-mono"
            />
          </div>

          {/* Export */}
          <button
            onClick={() => exportCSV(sorted, username)}
            className="flex items-center gap-2 h-8 px-3 rounded-md border border-whisper-border bg-transparent text-xs font-bold text-muted-steel cursor-pointer hover:text-ghost-white hover:border-ghost-white transition-colors uppercase font-mono tracking-widest"
          >
            <Download size={12} /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-canvas-night/5 border-b border-whisper-border">
              {([
                ["title",    "PR Title"],
                ["repo",     "Repository"],
                [null,       "Labels"],
                [null,       "Difficulty"],
                [null,       "Quality"],
                [null,       "Type Bonus"],
                ["points",   "Points"],
                ["mergedAt", "Merged"],
                [null,       ""],
              ] as [SortKey | null, string][]).map(([key, label], i) => (
                <th key={i} className={`px-4 py-3 text-left whitespace-nowrap ${i < 8 ? 'border-r border-whisper-border' : ''}`}>
                  {key ? (
                    <SortBtn col={key} active={sortKey} dir={sortDir} onToggle={toggleSort}>
                      {label}
                    </SortBtn>
                  ) : (
                    <span className="text-[11px] font-bold text-muted-steel uppercase tracking-widest font-mono">
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
                <td colSpan={9} className="p-8 text-center text-muted-steel text-sm">
                  {query ? "No PRs match your search" : "No PRs found"}
                </td>
              </tr>
            ) : (
              pageData.map((pr, i) => (
                <tr key={pr.id} className={`group hover:bg-canvas-night/5 transition-colors ${i < pageData.length - 1 ? 'border-b border-whisper-border' : ''} ${!pr.isValid || pr.state !== "merged" ? 'bg-red-500/5' : ''}`}>
                  {/* Title */}
                  <td className="px-4 py-3 border-r border-whisper-border max-w-[260px]">
                    <span className="text-sm text-ghost-white font-medium block whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-primary transition-colors cursor-pointer">
                      {pr.title}
                    </span>
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${pr.state === 'merged' ? 'text-primary' : pr.state === 'open' ? 'text-yellow-500' : 'text-muted-steel'}`}>
                      {pr.state}
                    </span>
                  </td>

                  {/* Repo */}
                  <td className="px-4 py-3 border-r border-whisper-border">
                    <a href={pr.repoUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-muted-steel no-underline font-mono block whitespace-nowrap overflow-hidden text-ellipsis max-w-[160px] hover:text-primary transition-colors">
                      {pr.repo}
                    </a>
                  </td>

                  {/* Labels */}
                  <td className="px-4 py-3 border-r border-whisper-border">
                    <div className="flex flex-wrap gap-1 min-w-[120px]">
                      {pr.labels.map((l) => (
                        <LabelChip key={l} name={l} color={pr.labelColors[l]} />
                      ))}
                    </div>
                  </td>

                  {/* Difficulty */}
                  <td className="px-4 py-3 border-r border-whisper-border whitespace-nowrap">
                    {pr.difficulty ? (
                      <span className="text-xs text-muted-steel font-mono">
                        {pr.difficulty.replace("level:", "").toUpperCase()}
                        <span className="text-muted-steel/50"> +{pr.difficultyScore}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-muted-steel/50">—</span>
                    )}
                  </td>

                  {/* Quality */}
                  <td className="px-4 py-3 border-r border-whisper-border whitespace-nowrap">
                    {pr.quality ? (
                      <span className="text-xs text-muted-steel font-mono">
                        {pr.quality.replace("quality:", "").toUpperCase()}
                        <span className="text-muted-steel/50"> ×{pr.qualityMultiplier}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-muted-steel/50">×1</span>
                    )}
                  </td>

                  {/* Type bonuses */}
                  <td className="px-4 py-3 border-r border-whisper-border">
                    {pr.typeBonuses.length > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        {pr.typeBonuses.map((b) => (
                          <span key={b} className="text-[10px] font-mono text-muted-steel uppercase">
                            {b.replace("type:", "")}
                          </span>
                        ))}
                        {pr.typeBonusTotal > 0 && (
                          <span className="text-[10px] text-primary font-mono font-bold">
                            +{pr.typeBonusTotal}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-steel/50">—</span>
                    )}
                  </td>

                  {/* Points */}
                  <td className="px-4 py-3 border-r border-whisper-border whitespace-nowrap text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[15px] font-bold font-mono ${pr.points > 0 ? 'text-primary' : 'text-muted-steel/50'}`}>
                        {pr.points > 0 ? pr.points : "—"}
                      </span>
                      {(() => {
                        const info = notCountedInfo(pr);
                        return info ? <NotCountedBadge info={info} /> : null;
                      })()}
                    </div>
                  </td>

                  {/* Merged */}
                  <td className="px-4 py-3 border-r border-whisper-border whitespace-nowrap">
                    <span className="text-[11px] font-mono text-muted-steel">
                      {pr.mergedAt
                        ? new Date(pr.mergedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })
                        : "—"}
                    </span>
                  </td>

                  {/* Link */}
                  <td className="px-4 py-3 text-center">
                    <a href={pr.url} target="_blank" rel="noopener noreferrer"
                      className="text-muted-steel inline-flex hover:text-primary transition-colors">
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
        <div className="p-4 border-t border-whisper-border flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs text-muted-steel font-mono uppercase">Page {page} of {totalPages}</span>
          <div className="flex gap-1 items-center">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} suppressHydrationWarning
              className="h-7 px-2 rounded-md border border-whisper-border bg-transparent text-muted-steel text-sm hover:text-ghost-white hover:border-ghost-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">‹</button>
            {pageItems(page, totalPages).map((p, i) =>
              p === null
                ? <span key={`e${i}`} className="text-xs text-muted-steel/50 px-1">…</span>
                : <button key={p} onClick={() => setPage(p)} suppressHydrationWarning 
                    className={`w-7 h-7 rounded-md border text-xs font-mono transition-colors ${page === p ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-whisper-border bg-transparent text-muted-steel hover:text-ghost-white hover:border-ghost-white'}`}>
                    {p}
                  </button>
            )}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} suppressHydrationWarning
              className="h-7 px-2 rounded-md border border-whisper-border bg-transparent text-muted-steel text-sm hover:text-ghost-white hover:border-ghost-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">›</button>
          </div>
        </div>
      )}
    </section>
  );
}
