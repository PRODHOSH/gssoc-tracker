import { unstable_cache } from "next/cache";
import { GSSOC_REPO_SET } from "@/data/gssoc-repos";
import type {
  GitHubUser,
  RawGitHubPR,
  TrackedPR,
  PRTrackerData,
  PRRank,
} from "@/types/pr-tracker";

/* ── Scoring tables ──────────────────────────────────────────── */

const DIFFICULTY_SCORES: Record<string, number> = {
  "level:beginner": 20,
  "level:intermediate": 35,
  "level:advanced": 55,
  "level:critical": 80,
};

const QUALITY_MULTIPLIERS: Record<string, number> = {
  "quality:clean": 1.2,
  "quality:exceptional": 1.5,
};

const TYPE_BONUSES: Record<string, number> = {
  "type:docs": 5,
  "type:testing": 10,
  "type:design": 10,
  "type:refactor": 10,
  "type:bug": 10,
  "type:feature": 10,
  "type:accessibility": 15,
  "type:performance": 15,
  "type:devops": 15,
  "type:security": 20,
};

const INVALID_LABELS = ["gssoc:invalid", "gssoc:spam", "gssoc:ai-slop"];
const REQUIRED_LABEL = "gssoc:approved";

/* ── Rank thresholds ─────────────────────────────────────────── */

export function getRank(points: number): PRRank {
  if (points <= 100) return "Beginner Contributor";
  if (points <= 300) return "Active Contributor";
  if (points <= 700) return "Advanced Contributor";
  if (points <= 1200) return "Elite Contributor";
  return "GSSoC Legend";
}

/* ── Point calculation ───────────────────────────────────────── */

function calcPoints(labelNames: string[]) {
  const hasInvalid = labelNames.some((l) => INVALID_LABELS.includes(l));
  const hasApproved = labelNames.includes(REQUIRED_LABEL);

  if (hasInvalid || !hasApproved) {
    return {
      difficulty: null,
      difficultyScore: 0,
      quality: null,
      qualityMultiplier: 1,
      typeBonuses: [] as string[],
      typeBonusTotal: 0,
      points: 0,
      isValid: false,
    };
  }

  const difficultyLabel = labelNames.find((l) => l in DIFFICULTY_SCORES) ?? null;
  const difficultyScore = difficultyLabel ? DIFFICULTY_SCORES[difficultyLabel] : 20;

  const qualityLabel = labelNames.find((l) => l in QUALITY_MULTIPLIERS) ?? null;
  const qualityMultiplier = qualityLabel ? QUALITY_MULTIPLIERS[qualityLabel] : 1;

  const typeBonuses = labelNames.filter((l) => l in TYPE_BONUSES);
  const typeBonusTotal = typeBonuses.reduce((sum, l) => sum + TYPE_BONUSES[l], 0);

  // Formula: 50 (base) + (difficulty × quality) + type_bonus
  const points = Math.round(50 + difficultyScore * qualityMultiplier + typeBonusTotal);

  return {
    difficulty: difficultyLabel,
    difficultyScore,
    quality: qualityLabel,
    qualityMultiplier,
    typeBonuses,
    typeBonusTotal,
    points,
    isValid: true,
  };
}

/* ── Streak calculation ──────────────────────────────────────── */

function calcStreak(mergedDates: string[]): number {
  if (!mergedDates.length) return 0;

  const days = [
    ...new Set(
      mergedDates.map((d) => new Date(d).toISOString().slice(0, 10))
    ),
  ].sort((a, b) => (a > b ? -1 : 1));

  let streak = 1;
  for (let i = 0; i < days.length - 1; i++) {
    const curr = new Date(days[i]);
    const next = new Date(days[i + 1]);
    const diff = (curr.getTime() - next.getTime()) / 86_400_000;
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/* ── GitHub fetch helper ─────────────────────────────────────── */

async function ghFetch(url: string): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GH_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  // cache: "no-store" here — unstable_cache on the outer function handles deduplication
  return fetch(url, { headers, cache: "no-store" });
}

/* ── Public API ──────────────────────────────────────────────── */

export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const res = await ghFetch(
    `https://api.github.com/users/${encodeURIComponent(username)}`
  );
  if (res.status === 404) throw new Error("USER_NOT_FOUND");
  if (res.status === 403 || res.status === 429) throw new Error("RATE_LIMITED");
  if (!res.ok) throw new Error(`API_ERROR:${res.status}`);
  return res.json() as Promise<GitHubUser>;
}

export async function fetchGSSoCPRs(username: string): Promise<RawGitHubPR[]> {
  // Search only for gssoc:approved — all other labels (level, quality, type, invalid)
  // come back in the PR response automatically, no extra API calls needed.
  const q = `type:pr author:${username} label:"gssoc:approved"`;
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=100&sort=created&order=desc`;
  const res = await ghFetch(url);
  if (res.status === 403 || res.status === 429) throw new Error("RATE_LIMITED");
  if (res.status === 422 || res.status === 404) return [];
  if (!res.ok) throw new Error(`API_ERROR:${res.status}`);

  const data = await res.json() as { items: RawGitHubPR[]; total_count: number };
  const all = [...data.items];

  // Paginate if user has more than 100 approved PRs
  if (data.total_count > 100) {
    const pages = Math.min(Math.ceil((data.total_count - 100) / 100), 9);
    const rest = await Promise.all(
      Array.from({ length: pages }, async (_, i) => {
        const pageUrl = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=100&page=${i + 2}&sort=created&order=desc`;
        const r = await ghFetch(pageUrl);
        if (!r.ok) return [];
        const d = await r.json() as { items: RawGitHubPR[] };
        return d.items;
      })
    );
    rest.forEach((items) => all.push(...items));
  }

  return all;
}

function repoFromUrl(repositoryUrl: string): { name: string; url: string } {
  // repositoryUrl: https://api.github.com/repos/owner/repo
  const parts = repositoryUrl.split("/");
  const owner = parts[parts.length - 2];
  const repo = parts[parts.length - 1];
  return { name: `${owner}/${repo}`, url: `https://github.com/${owner}/${repo}` };
}

async function _buildPRTrackerData(username: string): Promise<PRTrackerData> {
  const [user, rawPRs] = await Promise.all([
    fetchGitHubUser(username),
    fetchGSSoCPRs(username),
  ]);

  const allPRs: TrackedPR[] = rawPRs.filter((pr) => {
    const { name: repo } = repoFromUrl(pr.repository_url);
    return GSSOC_REPO_SET.has(repo.toLowerCase());
  }).map((pr) => {
    const labelNames = pr.labels.map((l) => l.name);
    const labelColors: Record<string, string> = {};
    pr.labels.forEach((l) => {
      labelColors[l.name] = `#${l.color}`;
    });

    const isMerged = !!pr.pull_request?.merged_at;
    const { name: repo, url: repoUrl } = repoFromUrl(pr.repository_url);

    const calc = calcPoints(labelNames);

    return {
      id: pr.id,
      number: pr.number,
      title: pr.title,
      url: pr.html_url,
      repo,
      repoUrl,
      state: isMerged ? "merged" : pr.state === "open" ? "open" : "closed",
      mergedAt: pr.pull_request?.merged_at ?? null,
      createdAt: pr.created_at,
      labels: labelNames,
      labelColors,
      isGSSoC: labelNames.some((l) => l.startsWith("gssoc")),
      ...calc,
    };
  });

  const validPRs = allPRs.filter((pr) => pr.isValid && pr.state === "merged");
  const totalPoints = validPRs.reduce((s, pr) => s + pr.points, 0);
  const uniqueRepos = new Set(validPRs.map((pr) => pr.repo)).size;
  const streak = calcStreak(validPRs.map((pr) => pr.mergedAt!));

  return {
    user,
    allPRs,
    validPRs,
    totalPoints,
    totalMergedGSSoC: allPRs.filter((pr) => pr.state === "merged").length,
    totalApproved: allPRs.filter((pr) => pr.labels.includes("gssoc:approved")).length,
    uniqueRepos,
    streak,
    rank: getRank(totalPoints),
    fetchedAt: new Date().toISOString(),
  };
}

// Cache per username for 5 minutes — shared across all requests on the same deployment
export const buildPRTrackerData = unstable_cache(
  async (username: string) => _buildPRTrackerData(username.toLowerCase()),
  ["pr-tracker-data"],
  { revalidate: 300 }
);
