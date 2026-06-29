import { unstable_cache } from "next/cache";
import type { RawGitHubPR } from "@/types/pr-tracker";

/* ── Scoring (same as contributor) ──────────────────────────── */

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

/* ── Types ───────────────────────────────────────────────────── */

export interface RepoInfo {
  full_name: string;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  owner: { login: string; avatar_url: string };
}

interface RawPRWithUser extends RawGitHubPR {
  user: { login: string; avatar_url: string; html_url: string };
}

export interface ProjectAdminPR {
  id: number;
  number: number;
  title: string;
  url: string;
  repo: string;
  repoUrl: string;
  state: "merged" | "open" | "closed";
  mergedAt: string | null;
  createdAt: string;
  labels: string[];
  labelColors: Record<string, string>;
  author: string;
  authorUrl: string;
  authorAvatar: string;
  isValid: boolean;
  points: number;
  difficulty: string | null;
  difficultyScore: number;
  quality: string | null;
  qualityMultiplier: number;
  typeBonuses: string[];
  typeBonusTotal: number;
}

export interface ProjectAdminData {
  repo: RepoInfo;
  allPRs: ProjectAdminPR[];
  validPRs: ProjectAdminPR[];
  totalPoints: number;
  totalMerged: number;
  uniqueContributors: number;
  fetchedAt: string;
}

/* ── Fetch helpers ───────────────────────────────────────────── */

async function ghFetch(url: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GH_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(url, { headers, cache: "no-store" });
}

async function fetchRepoInfo(owner: string, repo: string): Promise<RepoInfo> {
  const res = await ghFetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (res.status === 404) throw new Error("REPO_NOT_FOUND");
  if (res.status === 403 || res.status === 429) throw new Error("RATE_LIMITED");
  if (!res.ok) throw new Error(`API_ERROR:${res.status}`);
  return res.json() as Promise<RepoInfo>;
}

async function fetchRepoPRs(owner: string, repo: string): Promise<RawPRWithUser[]> {
  const q = `label:"gssoc:approved" repo:${owner}/${repo} type:pr`;
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=100&sort=created&order=desc`;
  const res = await ghFetch(url);
  if (res.status === 403 || res.status === 429) throw new Error("RATE_LIMITED");
  if (res.status === 422 || res.status === 404) return [];
  if (!res.ok) throw new Error(`API_ERROR:${res.status}`);

  const data = await res.json() as { items: RawPRWithUser[]; total_count: number };
  const all = [...data.items];

  if (data.total_count > 100) {
    const pages = Math.min(Math.ceil((data.total_count - 100) / 100), 9);
    const rest = await Promise.all(
      Array.from({ length: pages }, async (_, i) => {
        const pageUrl = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=100&page=${i + 2}&sort=created&order=desc`;
        const r = await ghFetch(pageUrl);
        if (!r.ok) return [] as RawPRWithUser[];
        const d = await r.json() as { items: RawPRWithUser[] };
        return d.items;
      })
    );
    rest.forEach((items) => all.push(...items));
  }

  return all;
}

function calcPoints(labelNames: string[]) {
  const hasInvalid = labelNames.some((l) => INVALID_LABELS.includes(l));
  const hasApproved = labelNames.includes("gssoc:approved");

  if (hasInvalid || !hasApproved) {
    return { isValid: false, points: 0, difficulty: null, difficultyScore: 0, quality: null, qualityMultiplier: 1, typeBonuses: [] as string[], typeBonusTotal: 0 };
  }

  const difficulty = labelNames.find((l) => l in DIFFICULTY_SCORES) ?? null;
  const difficultyScore = difficulty ? DIFFICULTY_SCORES[difficulty] : 20;
  const quality = labelNames.find((l) => l in QUALITY_MULTIPLIERS) ?? null;
  const qualityMultiplier = quality ? QUALITY_MULTIPLIERS[quality] : 1;
  const typeBonuses = labelNames.filter((l) => l in TYPE_BONUSES);
  const typeBonusTotal = typeBonuses.reduce((sum, l) => sum + TYPE_BONUSES[l], 0);
  const points = Math.round(50 + difficultyScore * qualityMultiplier + typeBonusTotal);

  return { isValid: true, points, difficulty, difficultyScore, quality, qualityMultiplier, typeBonuses, typeBonusTotal };
}

function repoFromUrl(repositoryUrl: string) {
  const parts = repositoryUrl.split("/");
  return {
    name: `${parts[parts.length - 2]}/${parts[parts.length - 1]}`,
    url: `https://github.com/${parts[parts.length - 2]}/${parts[parts.length - 1]}`,
  };
}

/* ── Public API ──────────────────────────────────────────────── */

async function _buildProjectAdminData(owner: string, repo: string): Promise<ProjectAdminData> {
  const [repoInfo, rawPRs] = await Promise.all([
    fetchRepoInfo(owner, repo),
    fetchRepoPRs(owner, repo),
  ]);

  const allPRs: ProjectAdminPR[] = rawPRs.map((pr) => {
    const labelNames = pr.labels.map((l) => l.name);
    const labelColors: Record<string, string> = {};
    pr.labels.forEach((l) => { labelColors[l.name] = `#${l.color}`; });

    const isMerged = !!pr.pull_request?.merged_at;
    const { name: repoName, url: repoUrl } = repoFromUrl(pr.repository_url);
    const calc = calcPoints(labelNames);

    // Only merged PRs earn points — open/closed PRs show 0
    const finalCalc = isMerged ? calc : { ...calc, isValid: false, points: 0 };

    return {
      id: pr.id,
      number: pr.number,
      title: pr.title,
      url: pr.html_url,
      repo: repoName,
      repoUrl,
      state: isMerged ? "merged" : pr.state === "open" ? "open" : "closed",
      mergedAt: pr.pull_request?.merged_at ?? null,
      createdAt: pr.created_at,
      labels: labelNames,
      labelColors,
      author: pr.user.login,
      authorUrl: `https://github.com/${pr.user.login}`,
      authorAvatar: pr.user.avatar_url,
      ...finalCalc,
    };
  });

  const validPRs = allPRs.filter((pr) => pr.isValid && pr.state === "merged");
  const totalPoints = validPRs.reduce((s, p) => s + p.points, 0);
  const totalMerged = allPRs.filter((p) => p.state === "merged").length;
  const uniqueContributors = new Set(validPRs.map((p) => p.author)).size;

  return {
    repo: repoInfo,
    allPRs,
    validPRs,
    totalPoints,
    totalMerged,
    uniqueContributors,
    fetchedAt: new Date().toISOString(),
  };
}

// Cache per owner+repo for 5 minutes — shared across all requests on the same deployment
export const buildProjectAdminData = (owner: string, repo: string) => {
  const o = owner.toLowerCase();
  const r = repo.toLowerCase();
  return unstable_cache(
    async () => _buildProjectAdminData(o, r),
    ["project-admin-data", o, r],
    { revalidate: 300 }
  )();
};
