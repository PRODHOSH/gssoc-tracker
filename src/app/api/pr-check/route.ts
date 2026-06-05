import { NextRequest, NextResponse } from "next/server";
import { GSSOC_REPO_SET } from "@/data/gssoc-repos";

export const dynamic = "force-dynamic";

const PR_URL_RE = /github\.com\/([^/\s]+)\/([^/\s]+)\/pull\/(\d+)/;

const DIFFICULTY_SCORES: Record<string, number> = {
  "level:beginner":     20,
  "level:intermediate": 35,
  "level:advanced":     55,
  "level:critical":     80,
};

const QUALITY_MULTIPLIERS: Record<string, number> = {
  "quality:clean":       1.2,
  "quality:exceptional": 1.5,
};

const TYPE_BONUSES: Record<string, number> = {
  "type:docs":          5,
  "type:testing":       10,
  "type:design":        10,
  "type:refactor":      10,
  "type:bug":           10,
  "type:feature":       10,
  "type:accessibility": 15,
  "type:performance":   15,
  "type:devops":        15,
  "type:security":      20,
};

const INVALID_LABELS = new Set(["gssoc:invalid", "gssoc:spam", "gssoc:ai-slop"]);

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get("url")?.trim() ?? "";

  const match = rawUrl.match(PR_URL_RE);
  if (!match) {
    return NextResponse.json(
      { error: "Invalid URL. Paste a full GitHub PR link like github.com/owner/repo/pull/123", code: "INVALID_URL" },
      { status: 400 }
    );
  }

  const [, owner, repo, prNum] = match;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GH_TOKEN) headers.Authorization = `Bearer ${process.env.GH_TOKEN}`;

  let res: Response;
  try {
    res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNum}`, {
      headers,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "Could not reach GitHub. Check your connection.", code: "NETWORK_ERROR" }, { status: 503 });
  }

  if (res.status === 404) {
    return NextResponse.json(
      { error: "PR not found. Double-check the URL, or the repo may be private.", code: "PR_NOT_FOUND" },
      { status: 404 }
    );
  }
  if (res.status === 403 || res.status === 429) {
    return NextResponse.json(
      { error: "GitHub API rate limit reached. Try again in a minute.", code: "RATE_LIMITED" },
      { status: 429 }
    );
  }
  if (!res.ok) {
    return NextResponse.json({ error: "GitHub API error.", code: "API_ERROR" }, { status: 500 });
  }

  const pr = await res.json();

  const labelNames: string[] = pr.labels.map((l: { name: string }) => l.name);
  const labels: Array<{ name: string; color: string }> = pr.labels.map(
    (l: { name: string; color: string }) => ({ name: l.name, color: `#${l.color}` })
  );

  const hasApproved  = labelNames.includes("gssoc:approved");
  const invalidLabel = labelNames.find(l => INVALID_LABELS.has(l)) ?? null;
  const isMerged     = !!pr.merged_at;
  const repoKey      = pr.base.repo.full_name.toLowerCase();
  const isOfficial   = GSSOC_REPO_SET.has(repoKey);

  type Verdict = "valid" | "pending" | "not_approved" | "flagged" | "closed" | "unofficial";
  let verdict: Verdict;
  if (invalidLabel) {
    verdict = "flagged";
  } else if (!hasApproved) {
    verdict = "not_approved";
  } else if (pr.state === "closed" && !isMerged) {
    verdict = "closed";
  } else if (!isMerged) {
    verdict = "pending";
  } else if (!isOfficial) {
    verdict = "unofficial";
  } else {
    verdict = "valid";
  }

  // Points only apply for merged + approved + not flagged
  const canScore = hasApproved && isMerged && !invalidLabel;

  const difficultyLabel    = canScore ? (labelNames.find(l => l in DIFFICULTY_SCORES) ?? null) : null;
  const usedDefaultDiff    = canScore && !difficultyLabel;
  const difficultyScore    = canScore ? (difficultyLabel ? DIFFICULTY_SCORES[difficultyLabel] : 20) : 0;
  const qualityLabel       = canScore ? (labelNames.find(l => l in QUALITY_MULTIPLIERS) ?? null) : null;
  const qualityMultiplier  = qualityLabel ? QUALITY_MULTIPLIERS[qualityLabel] : 1;
  const qualityBonus       = canScore ? Math.round(difficultyScore * (qualityMultiplier - 1)) : 0;
  const typeBonuses        = canScore ? labelNames.filter(l => l in TYPE_BONUSES) : [];
  const typeBonusTotal     = typeBonuses.reduce((s, l) => s + TYPE_BONUSES[l], 0);
  const points             = canScore ? Math.round(50 + difficultyScore * qualityMultiplier + typeBonusTotal) : 0;

  return NextResponse.json({
    pr: {
      number:      pr.number,
      title:       pr.title,
      url:         pr.html_url,
      repo:        pr.base.repo.full_name,
      repoUrl:     pr.base.repo.html_url,
      author:      pr.user.login,
      authorUrl:   pr.user.html_url,
      authorAvatar: pr.user.avatar_url,
      state:       isMerged ? "merged" : pr.state === "open" ? "open" : "closed",
      mergedAt:    pr.merged_at ?? null,
      createdAt:   pr.created_at,
      labels,
    },
    verdict,
    isOfficialRepo: isOfficial,
    points,
    scoring: {
      base:             canScore ? 50 : 0,
      difficultyLabel,
      difficultyScore,
      usedDefaultDiff,
      qualityLabel,
      qualityMultiplier,
      qualityBonus,
      typeBonuses,
      typeBonusTotal,
      total: points,
    },
    flags: {
      hasApproved,
      invalidLabel,
      isMerged,
      isOfficial,
    },
  }, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
