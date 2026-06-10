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
const MAX_PR_POINTS = 175;
const MIN_EXCEPTIONAL_REVIEW_LENGTH = 30;

// When multiple difficulty/quality labels are applied, the lowest one wins —
// this protects against label-stacking inflating a PR's score.
function lowestLabel(labelNames: string[], scores: Record<string, number>): string | null {
  const matched = labelNames.filter((l) => l in scores);
  if (!matched.length) return null;
  return matched.reduce((lowest, l) => (scores[l] < scores[lowest] ? l : lowest));
}

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
  const canScore = hasApproved && isMerged && !invalidLabel && isOfficial;

  const difficultyLabel    = canScore ? lowestLabel(labelNames, DIFFICULTY_SCORES) : null;
  const usedDefaultDiff    = canScore && !difficultyLabel;
  const difficultyScore    = canScore ? (difficultyLabel ? DIFFICULTY_SCORES[difficultyLabel] : 20) : 0;
  const qualityLabel       = canScore ? lowestLabel(labelNames, QUALITY_MULTIPLIERS) : null;
  let qualityMultiplier    = qualityLabel ? QUALITY_MULTIPLIERS[qualityLabel] : 1;

  // quality:exceptional requires a substantive review comment (>30 chars);
  // without one it falls back to the ×1.0 multiplier.
  let qualityDowngraded = false;
  if (canScore && qualityLabel === "quality:exceptional") {
    try {
      const reviewsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNum}/reviews`, { headers, cache: "no-store" });
      if (reviewsRes.ok) {
        const reviews = await reviewsRes.json() as { body: string }[];
        const hasSubstantiveReview = reviews.some(r => r.body && r.body.trim().length > MIN_EXCEPTIONAL_REVIEW_LENGTH);
        if (!hasSubstantiveReview) {
          qualityMultiplier = 1;
          qualityDowngraded = true;
        }
      }
    } catch {
      // can't verify — don't penalize on a failed lookup
    }
  }

  const qualityBonus       = canScore ? Math.round(difficultyScore * (qualityMultiplier - 1)) : 0;
  const typeBonuses        = canScore ? labelNames.filter(l => l in TYPE_BONUSES) : [];
  const typeBonusTotal     = typeBonuses.reduce((s, l) => s + TYPE_BONUSES[l], 0);
  const points             = canScore ? Math.min(Math.round(50 + difficultyScore * qualityMultiplier + typeBonusTotal), MAX_PR_POINTS) : 0;

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
      qualityDowngraded,
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
