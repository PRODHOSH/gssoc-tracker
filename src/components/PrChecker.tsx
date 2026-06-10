"use client";
import { useState, FormEvent } from "react";
import Image from "next/image";
import {
  Loader2, AlertCircle, ExternalLink,
  CheckCircle2, XCircle, AlertTriangle, Info,
  GitMerge, GitPullRequest, Clock, Link2,
} from "lucide-react";
import { ds, fontMono } from "@/lib/ds";
import { getLabelChipColors } from "@/lib/labelColors";

/* ── Types ───────────────────────────────────────────────────── */

type Verdict = "valid" | "pending" | "not_approved" | "flagged" | "closed" | "unofficial";

interface PrLabel { name: string; color: string; }

interface PrCheckResult {
  pr: {
    number: number; title: string; url: string;
    repo: string; repoUrl: string;
    author: string; authorUrl: string; authorAvatar: string;
    state: "merged" | "open" | "closed";
    mergedAt: string | null; createdAt: string;
    labels: PrLabel[];
  };
  verdict: Verdict;
  isOfficialRepo: boolean;
  points: number;
  scoring: {
    base: number;
    difficultyLabel: string | null; difficultyScore: number; usedDefaultDiff: boolean;
    qualityLabel: string | null; qualityMultiplier: number; qualityBonus: number; qualityDowngraded: boolean;
    typeBonuses: string[]; typeBonusTotal: number; total: number;
  };
  flags: { hasApproved: boolean; invalidLabel: string | null; isMerged: boolean; isOfficial: boolean; };
}

/* ── Verdict config ──────────────────────────────────────────── */

const VERDICT_META: Record<Verdict, { color: string; bg: string; border: string; icon: React.ReactNode; title: string; desc: string }> = {
  valid: {
    color: "#16a34a", bg: "rgba(22,163,74,0.07)", border: "rgba(22,163,74,0.2)",
    icon: <CheckCircle2 size={18} color="#16a34a" />,
    title: "Valid",
    desc: "This PR is merged, approved, and in an official GSSoC 2026 repo. It counts toward your score.",
  },
  pending: {
    color: "#d97706", bg: "rgba(217,119,6,0.07)", border: "rgba(217,119,6,0.2)",
    icon: <Clock size={18} color="#d97706" />,
    title: "Pending merge",
    desc: "Approved and in an official repo. Points will apply once the PR is merged.",
  },
  not_approved: {
    color: "#dc2626", bg: "rgba(220,38,38,0.07)", border: "rgba(220,38,38,0.2)",
    icon: <XCircle size={18} color="#dc2626" />,
    title: "Not approved",
    desc: "Missing the gssoc:approved label. A GSSoC mentor needs to apply it before this PR counts.",
  },
  flagged: {
    color: "#dc2626", bg: "rgba(220,38,38,0.07)", border: "rgba(220,38,38,0.2)",
    icon: <XCircle size={18} color="#dc2626" />,
    title: "Flagged",
    desc: "This PR has been marked invalid by a GSSoC reviewer. It scores 0 points and will not count.",
  },
  closed: {
    color: "#6b7280", bg: "rgba(107,114,128,0.07)", border: "rgba(107,114,128,0.2)",
    icon: <XCircle size={18} color="#6b7280" />,
    title: "Closed without merge",
    desc: "This PR was closed before being merged. It will not count toward your score.",
  },
  unofficial: {
    color: "#dc2626", bg: "rgba(220,38,38,0.07)", border: "rgba(220,38,38,0.2)",
    icon: <XCircle size={18} color="#dc2626" />,
    title: "Not an official GSSoC 2026 repo",
    desc: "This repo is not in the official GSSoC 2026 registered project list. This PR does not count toward your GSSoC score and will not appear on the leaderboard.",
  },
};

/* ── Sub-components ──────────────────────────────────────────── */

function CheckRow({
  status, label, detail,
}: {
  status: "pass" | "fail" | "warn" | "info";
  label: string;
  detail?: string;
}) {
  const icons = {
    pass: <CheckCircle2 size={15} color="#16a34a" />,
    fail: <XCircle     size={15} color="#dc2626" />,
    warn: <AlertTriangle size={15} color="#d97706" />,
    info: <Info        size={15} color={ds.inkMute} />,
  };
  const textColor = {
    pass: ds.ink,
    fail: "#dc2626",
    warn: "#92400e",
    info: ds.inkMute,
  };

  return (
    <div style={{
      display: "flex", gap: 10, padding: "11px 0",
      borderBottom: `1px solid ${ds.hairlineCool}`,
    }}>
      <div style={{ flexShrink: 0, marginTop: 1 }}>{icons[status]}</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: textColor[status] }}>{label}</div>
        {detail && (
          <div style={{ fontSize: 12, color: ds.inkMute, marginTop: 3, lineHeight: 1.55 }}>{detail}</div>
        )}
      </div>
    </div>
  );
}

function ScoreRow({
  label, value, note, total,
}: {
  label: string; value: string; note?: string; total?: boolean;
}) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
      padding: total ? "10px 0 0" : "7px 0",
      borderTop: total ? `1.5px solid ${ds.hairline}` : undefined,
      marginTop: total ? 2 : 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 13, color: total ? ds.ink : ds.inkMute, fontWeight: total ? 600 : 400 }}>
          {label}
        </span>
        {note && <span style={{ fontSize: 11, color: ds.inkFaint }}>{note}</span>}
      </div>
      <span style={{
        fontSize: total ? 15 : 13,
        fontWeight: total ? 700 : 500,
        color: total ? ds.primaryDeep : ds.ink,
        fontFamily: fontMono,
      }}>
        {value}
      </span>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */

export function PrChecker() {
  const [urlInput, setUrlInput]   = useState("");
  const [phase, setPhase]         = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult]       = useState<PrCheckResult | null>(null);
  const [errorMsg, setErrorMsg]   = useState("");

  async function check(e: FormEvent) {
    e.preventDefault();
    const val = urlInput.trim();
    if (!val) return;

    setPhase("loading");
    setResult(null);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/pr-check?url=${encodeURIComponent(val)}`);
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong. Try again.");
        setPhase("error");
        return;
      }

      setResult(data as PrCheckResult);
      setPhase("success");
    } catch {
      setErrorMsg("Could not reach the server. Check your connection.");
      setPhase("error");
    }
  }

  const vm = result ? VERDICT_META[result.verdict] : null;

  return (
    <div>
      {/* ── Input form ── */}
      <div style={{
        background: ds.canvas,
        border: `1px solid ${ds.hairline}`,
        borderRadius: ds.rLg,
        padding: "20px 20px 18px",
        marginBottom: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Link2 size={14} color={ds.inkMute} />
          <span style={{ fontSize: 13, fontWeight: 600, color: ds.ink }}>Paste a GitHub PR link</span>
        </div>

        <form onSubmit={check} style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={urlInput}
            onChange={(e) => { setUrlInput(e.target.value); if (phase === "error") setPhase("idle"); }}
            placeholder="https://github.com/owner/repo/pull/123"
            autoComplete="off"
            style={{
              flex: 1, height: 42, padding: "0 14px",
              borderRadius: ds.rMd,
              border: `1.5px solid ${phase === "error" ? "rgba(220,38,38,0.4)" : ds.hairline}`,
              background: ds.canvasSoft,
              color: ds.ink, fontSize: 13,
              fontFamily: fontMono, outline: "none",
              transition: "border-color 0.13s",
              minWidth: 0,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(62,207,142,0.5)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = phase === "error" ? "rgba(220,38,38,0.4)" : ds.hairline)}
          />
          <button
            type="submit"
            disabled={phase === "loading" || !urlInput.trim()}
            style={{
              height: 42, padding: "0 18px", borderRadius: ds.rMd, border: "none",
              background: urlInput.trim() ? ds.primary : ds.hairlineCool,
              color: urlInput.trim() ? ds.onPrimary : ds.inkFaint,
              fontSize: 13, fontWeight: 600,
              cursor: phase === "loading" || !urlInput.trim() ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
              transition: "background 0.13s",
            }}
          >
            {phase === "loading"
              ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Checking…</>
              : "Check →"}
          </button>
        </form>

        {phase === "error" && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 7, marginTop: 10,
            padding: "9px 12px", borderRadius: ds.rSm,
            background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.15)",
          }}>
            <AlertCircle size={13} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 12, color: "#dc2626", lineHeight: 1.5 }}>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* ── Result ── */}
      {phase === "success" && result && vm && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* PR header */}
          <div style={{
            background: ds.canvas, border: `1px solid ${ds.hairline}`,
            borderRadius: ds.rLg, padding: "18px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              {/* State chip */}
              {result.pr.state === "merged" && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "3px 9px", borderRadius: ds.rFull,
                  background: "rgba(130,80,255,0.08)", border: "1px solid rgba(130,80,255,0.2)",
                  fontSize: 11, fontWeight: 600, color: "#7c3aed",
                }}>
                  <GitMerge size={11} /> Merged
                </span>
              )}
              {result.pr.state === "open" && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "3px 9px", borderRadius: ds.rFull,
                  background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)",
                  fontSize: 11, fontWeight: 600, color: "#16a34a",
                }}>
                  <GitPullRequest size={11} /> Open
                </span>
              )}
              {result.pr.state === "closed" && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "3px 9px", borderRadius: ds.rFull,
                  background: "rgba(107,114,128,0.08)", border: "1px solid rgba(107,114,128,0.2)",
                  fontSize: 11, fontWeight: 600, color: "#6b7280",
                }}>
                  <XCircle size={11} /> Closed
                </span>
              )}
              <span style={{ fontSize: 12, color: ds.inkFaint, fontFamily: fontMono }}>
                #{result.pr.number}
              </span>
            </div>

            <a
              href={result.pr.url} target="_blank" rel="noopener noreferrer"
              style={{ display: "block", textDecoration: "none" }}
            >
              <div style={{ fontSize: 15, fontWeight: 600, color: ds.ink, lineHeight: 1.4, marginBottom: 10 }}>
                {result.pr.title}
              </div>
            </a>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Image
                  src={result.pr.authorAvatar} alt={result.pr.author}
                  width={18} height={18} unoptimized
                  style={{ borderRadius: "50%", display: "block" }}
                />
                <a
                  href={result.pr.authorUrl} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: ds.inkMute, textDecoration: "none" }}
                >
                  @{result.pr.author}
                </a>
              </div>
              <span style={{ fontSize: 11, color: ds.hairlineStrong }}>·</span>
              <a
                href={result.pr.repoUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: ds.inkMute, textDecoration: "none" }}
              >
                {result.pr.repo}
                <ExternalLink size={10} />
              </a>
              {result.pr.mergedAt && (
                <>
                  <span style={{ fontSize: 11, color: ds.hairlineStrong }}>·</span>
                  <span style={{ fontSize: 12, color: ds.inkMute }}>
                    merged {new Date(result.pr.mergedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Verdict banner */}
          <div style={{
            padding: "14px 18px",
            borderRadius: ds.rLg,
            background: vm.bg,
            border: `1px solid ${vm.border}`,
            display: "flex", alignItems: "flex-start", gap: 12,
          }}>
            <div style={{ flexShrink: 0, marginTop: 1 }}>{vm.icon}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: vm.color, marginBottom: 3 }}>
                {vm.title}
              </div>
              <div style={{ fontSize: 13, color: vm.color, opacity: 0.85, lineHeight: 1.55 }}>
                {vm.desc}
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div style={{
            background: ds.canvas, border: `1px solid ${ds.hairline}`,
            borderRadius: ds.rLg, padding: "4px 20px 0",
          }}>
            <div style={{ padding: "14px 0 8px", fontSize: 11, fontWeight: 700, color: ds.inkMute, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Checklist
            </div>

            {/* gssoc:approved */}
            <CheckRow
              status={result.flags.hasApproved ? "pass" : "fail"}
              label={result.flags.hasApproved ? "Has gssoc:approved label" : "Missing gssoc:approved label"}
              detail={!result.flags.hasApproved ? "A GSSoC mentor needs to review and apply this label. Without it, this PR scores 0 points." : undefined}
            />

            {/* Invalid flags */}
            <CheckRow
              status={result.flags.invalidLabel ? "fail" : "pass"}
              label={result.flags.invalidLabel
                ? `Flagged as ${result.flags.invalidLabel}`
                : "No invalid flags"}
              detail={result.flags.invalidLabel
                ? `This label means the PR was rejected by a GSSoC reviewer. It scores 0 points and will not count toward your total.`
                : undefined}
            />

            {/* Merged */}
            <CheckRow
              status={result.flags.isMerged ? "pass" : result.pr.state === "closed" ? "fail" : "warn"}
              label={result.flags.isMerged ? "PR is merged" : result.pr.state === "closed" ? "PR closed without merge" : "PR is open — not yet merged"}
              detail={
                !result.flags.isMerged && result.pr.state === "open"
                  ? "Points only count after the PR is merged. This will update once merged."
                  : !result.flags.isMerged && result.pr.state === "closed"
                  ? "The PR was closed before being merged and will not count."
                  : undefined
              }
            />

            {/* Official repo */}
            <CheckRow
              status={result.flags.isOfficial ? "pass" : "fail"}
              label={result.flags.isOfficial
                ? "Repo is in the official GSSoC 2026 list"
                : "Repo is NOT part of the official GSSoC 2026 registered projects"}
              detail={!result.flags.isOfficial
                ? "This PR will not count toward your GSSoC score. Only PRs in officially registered GSSoC 2026 projects are eligible."
                : undefined}
            />

            {/* Difficulty label — advisory */}
            {result.flags.hasApproved && result.flags.isMerged && !result.flags.invalidLabel && (
              <CheckRow
                status={result.scoring.usedDefaultDiff ? "warn" : "info"}
                label={result.scoring.difficultyLabel
                  ? `Difficulty: ${result.scoring.difficultyLabel} (+${result.scoring.difficultyScore} pts base)`
                  : "No difficulty label — default used (level:beginner, 20 pts)"}
                detail={result.scoring.usedDefaultDiff
                  ? "No level:* label found. The default beginner score (20 pts) is used. A mentor can add a difficulty label to increase your points."
                  : undefined}
              />
            )}

            {/* Quality label — advisory */}
            {result.flags.hasApproved && result.flags.isMerged && !result.flags.invalidLabel && result.scoring.qualityLabel && (
              <CheckRow
                status={result.scoring.qualityDowngraded ? "warn" : "info"}
                label={`Quality: ${result.scoring.qualityLabel} (×${result.scoring.qualityMultiplier} on difficulty → +${result.scoring.qualityBonus} pts)`}
                detail={result.scoring.qualityDowngraded
                  ? "quality:exceptional needs a substantive mentor review comment (>30 chars). None was found, so the multiplier fell back to ×1.0. A mentor can leave a review comment explaining why the PR is exceptional to restore the ×1.5 bonus."
                  : undefined}
              />
            )}

            {/* Type bonuses — advisory */}
            {result.flags.hasApproved && result.flags.isMerged && !result.flags.invalidLabel && result.scoring.typeBonuses.length > 0 && (
              <CheckRow
                status="info"
                label={`Type bonuses: ${result.scoring.typeBonuses.join(", ")} (+${result.scoring.typeBonusTotal} pts)`}
              />
            )}

            <div style={{ height: 6 }} />
          </div>

          {/* Points breakdown — only when points apply */}
          {result.scoring.total > 0 && (
            <div style={{
              background: ds.canvas, border: `1px solid ${ds.hairline}`,
              borderRadius: ds.rLg, padding: "4px 20px 16px",
            }}>
              <div style={{ padding: "14px 0 8px", fontSize: 11, fontWeight: 700, color: ds.inkMute, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Points breakdown
              </div>

              <ScoreRow label="Base" value={`${result.scoring.base}`} note="every approved PR" />
              <ScoreRow
                label={result.scoring.difficultyLabel ?? "Difficulty (default beginner)"}
                value={`+${result.scoring.difficultyScore}`}
              />
              {result.scoring.qualityBonus > 0 && (
                <ScoreRow
                  label={`Quality bonus (${result.scoring.qualityLabel}, ×${result.scoring.qualityMultiplier})`}
                  value={`+${result.scoring.qualityBonus}`}
                />
              )}
              {result.scoring.typeBonuses.map((b) => (
                <ScoreRow key={b} label={b} value={`+${getTypeBonus(b)}`} />
              ))}
              <ScoreRow label="Total" value={`${result.scoring.total} pts`} total />

              {result.verdict === "pending" && (
                <p style={{ margin: "10px 0 0", fontSize: 12, color: ds.inkMute, lineHeight: 1.6 }}>
                  These points will be added to your score once this PR is merged.
                </p>
              )}
            </div>
          )}

          {/* Labels */}
          {result.pr.labels.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {result.pr.labels.map((l) => {
                const c = getLabelChipColors(l.name, l.color);
                return (
                  <span
                    key={l.name}
                    style={{
                      padding: "3px 10px", borderRadius: ds.rFull,
                      fontSize: 11, fontWeight: 600,
                      background: c.bg,
                      border: `1px solid ${c.border}`,
                      color: c.color,
                    }}
                  >
                    {l.name}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const TYPE_BONUS_MAP: Record<string, number> = {
  "type:docs": 5, "type:testing": 10, "type:design": 10, "type:refactor": 10,
  "type:bug": 10, "type:feature": 10, "type:accessibility": 15,
  "type:performance": 15, "type:devops": 15, "type:security": 20,
};
function getTypeBonus(label: string) { return TYPE_BONUS_MAP[label] ?? 0; }
