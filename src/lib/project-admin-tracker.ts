import { supabase } from "./supabase";
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

/* ── GitHub paginated fetch ─────────────────────────────────── */

async function fetchPages(q: string, startPage: number, pages: number, order: "asc" | "desc"): Promise<RawPRWithUser[]> {
  const rest = await Promise.all(
    Array.from({ length: pages }, async (_, i) => {
      const pageUrl = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=100&page=${i + startPage}&sort=created&order=${order}`;
      const r = await ghFetch(pageUrl);
      if (!r.ok) return [] as RawPRWithUser[];
      const d = await r.json() as { items: RawPRWithUser[] };
      return d.items;
    })
  );
  const result: RawPRWithUser[] = [];
  rest.forEach((items) => result.push(...items));
  return result;
}

async function fetchAllFromGitHub(q: string): Promise<RawPRWithUser[]> {
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=100&sort=created&order=desc`;
  const res = await ghFetch(url);
  if (res.status === 403 || res.status === 429) throw new Error("RATE_LIMITED");
  if (res.status === 422 || res.status === 404) return [];
  if (!res.ok) throw new Error(`API_ERROR:${res.status}`);

  const data = await res.json() as { items: RawPRWithUser[]; total_count: number };
  const all = [...data.items];

  if (data.total_count > 100) {
    if (data.total_count > 1000) {
      // ASC/DESC hack to grab up to 2000 PRs (same pattern as pr-tracker)
      const [descPages, ascPages] = await Promise.all([
        fetchPages(q, 2, 9, "desc"),
        fetchPages(q, 1, 10, "asc"),
      ]);
      all.push(...descPages, ...ascPages);

      // Deduplicate by ID
      const unique = new Map<number, RawPRWithUser>();
      all.forEach((pr) => unique.set(pr.id, pr));
      return Array.from(unique.values());
    } else {
      const pages = Math.min(Math.ceil((data.total_count - 100) / 100), 9);
      const rest = await fetchPages(q, 2, pages, "desc");
      all.push(...rest);
    }
  }

  return all;
}

/* ── Supabase-cached fetch (mirrors pr-tracker pattern) ──────── */

/**
 * Fetches PRs for a repo with Supabase caching.
 *
 * Strategy:
 * - Cache key is `owner/repo` in `pa_repos` table.
 * - If last_synced_at < 1 minute ago, skip GitHub API and read from DB.
 * - Otherwise, delta-sync: fetch only PRs updated since last sync.
 * - Upsert new/changed PRs into `pa_pull_requests` table.
 * - Read all PRs back from DB.
 * - Falls back to direct GitHub fetch if Supabase is unavailable.
 */
async function fetchRepoPRs(owner: string, repo: string): Promise<RawPRWithUser[]> {
  const baseQ = `label:"gssoc:approved" repo:${owner}/${repo} type:pr`;
  const repoKey = `${owner}/${repo}`.toLowerCase();

  // No Supabase? Fall back to direct GitHub API fetch.
  if (!supabase) {
    return fetchAllFromGitHub(baseQ);
  }

  // Check last sync time
  const { data: repoRow } = await supabase
    .from("pa_repos")
    .select("last_synced_at")
    .eq("repo_key", repoKey)
    .single();

  const now = new Date();
  const lastSyncStr = repoRow?.last_synced_at;
  const lastSync = lastSyncStr ? new Date(lastSyncStr) : null;
  const timeSinceSync = lastSync ? now.getTime() - lastSync.getTime() : Infinity;

  // 1 minute cache — prevents stampedes while keeping data fresh
  if (timeSinceSync > 1 * 60 * 1000) {
    let q = baseQ;
    if (lastSync) {
      q += ` updated:>${lastSync.toISOString()}`;
    }

    // Update timestamp IMMEDIATELY to prevent cache stampedes
    if (!lastSync) {
      await supabase.from("pa_repos").upsert({ repo_key: repoKey, last_synced_at: now.toISOString() });
    } else {
      await supabase.from("pa_repos").update({ last_synced_at: now.toISOString() }).eq("repo_key", repoKey);
    }

    let deltaPRs: RawPRWithUser[] = [];
    try {
      deltaPRs = await fetchAllFromGitHub(q);
    } catch (err: any) {
      console.warn(`[project-admin-tracker] Delta sync failed for ${repoKey}, falling back to DB:`, err.message);
    }

    if (deltaPRs.length > 0) {
      const payload = deltaPRs.map((pr) => ({
        id: pr.id,
        repo_key: repoKey,
        raw_data: pr,
        updated_at: pr.updated_at,
      }));

      // Batch upsert in chunks of 100
      for (let i = 0; i < payload.length; i += 100) {
        await supabase.from("pa_pull_requests").upsert(payload.slice(i, i + 100), { onConflict: "id" });
      }
    }
  }

  // Read all cached PRs from Supabase
  let dbPRs: any[] = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("pa_pull_requests")
      .select("raw_data")
      .eq("repo_key", repoKey)
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Supabase error:", error);
      return fetchAllFromGitHub(baseQ);
    }

    dbPRs.push(...data);
    if (data.length < pageSize) {
      hasMore = false;
    } else {
      page++;
    }
  }

  return dbPRs.map((row: any) => row.raw_data as RawPRWithUser);
}

/* ── Point calculation ──────────────────────────────────────── */

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

export async function buildProjectAdminData(owner: string, repo: string): Promise<ProjectAdminData> {
  const ownerLc = owner.toLowerCase();
  const repoLc = repo.toLowerCase();

  const [repoInfo, rawPRs] = await Promise.all([
    fetchRepoInfo(ownerLc, repoLc),
    fetchRepoPRs(ownerLc, repoLc),
  ]);

  const allPRs: ProjectAdminPR[] = rawPRs.map((pr) => {
    const labelNames = pr.labels.map((l) => l.name);
    const labelColors: Record<string, string> = {};
    pr.labels.forEach((l) => { labelColors[l.name] = `#${l.color}`; });

    const isMerged = !!pr.pull_request?.merged_at;
    const { name: repoName, url: repoUrl } = repoFromUrl(pr.repository_url);
    const calc = calcPoints(labelNames);

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
      ...calc,
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
