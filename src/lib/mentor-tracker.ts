import { cache } from "react";
import { unstable_cache } from "next/cache";
import { supabase } from "./supabase";
import { fetchGitHubUser } from "@/lib/pr-tracker";
import { GSSOC_REPO_SET } from "@/data/gssoc-repos";
import type { RawGitHubPR, GitHubUser } from "@/types/pr-tracker";

const USERNAME_RE = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

export const MENTOR_LEVEL_SCORES: Record<string, number> = {
  "level:beginner":     10,
  "level:intermediate": 20,
  "level:advanced":     30,
  "level:critical":     50,
};

export const MENTOR_QUALITY_BONUS: Record<string, number> = {
  "quality:clean":       5,
  "quality:exceptional": 10,
};

export interface MentorPR {
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
  levelLabel: string | null;
  levelScore: number;
  qualityLabel: string | null;
  qualityBonus: number;
  points: number;
}

export interface MentorTrackerData {
  user: GitHubUser;
  prs: MentorPR[];
  totalPoints: number;
  totalPRs: number;
  fetchedAt: string;
}

async function ghFetch(url: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GH_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  // No next.revalidate here — unstable_cache handles caching at the function level
  return fetch(url, { headers, cache: "no-store" });
}

export async function fetchMentorPRs(rawUsername: string): Promise<RawGitHubPR[]> {
  const username = rawUsername.toLowerCase();
  const baseQ = `label:"mentor:${username}" type:pr`;
  const dbKey = `mentor:${username}`;

  if (!supabase) {
    return fetchAllFromGitHub(baseQ);
  }

  // Fire-and-forget: record visited_at so cron targets this mentor (no await)
  void supabase
    .from("users")
    .upsert({ github_login: dbKey, visited_at: new Date().toISOString() }, { onConflict: "github_login" });

  // Check if this mentor has ever been synced
  const { data: userRow } = await supabase
    .from("users")
    .select("last_synced_at")
    .eq("github_login", dbKey)
    .single();

  const hasBeenSynced = !!userRow?.last_synced_at;

  if (!hasBeenSynced) {
    // First-time mentor visit: sync immediately so they see their data
    console.log(`[mentor-tracker] First visit for ${username} — doing one-time sync`);
    await runMentorGitHubSync(username, baseQ);
  }

  // Always serve from DB — fast, zero GitHub API calls
  return readMentorFromDB(dbKey, baseQ);
}

/** Full GitHub → DB sync for a mentor. Called by first-visit and the cron. */
export async function runMentorGitHubSync(username: string, baseQ?: string): Promise<void> {
  if (!supabase) return;
  const dbKey = `mentor:${username}`;
  const q = baseQ ?? `label:"mentor:${username}" type:pr`;
  const now = new Date();
  const lockTime = new Date(now.getTime() + 3 * 60 * 1000);
  await supabase.from("users").upsert({ github_login: dbKey, last_synced_at: lockTime.toISOString() }, { onConflict: "github_login" });

  try {
    const prs = await fetchAllFromGitHub(q);
    await supabase.from("pull_requests").delete().eq("github_login", dbKey);

    if (prs.length > 0) {
      const payload = prs.map((pr) => ({
        id: pr.id,
        github_login: dbKey,
        raw_data: pr,
        updated_at: pr.updated_at,
      }));
      for (let i = 0; i < payload.length; i += 100) {
        await supabase.from("pull_requests").upsert(payload.slice(i, i + 100), { onConflict: "id,github_login" });
      }
    }

    await supabase.from("users").update({ last_synced_at: now.toISOString() }).eq("github_login", dbKey);
  } catch (err: any) {
    console.warn(`[mentor-tracker] Sync failed for ${username}:`, err.message);
    try {
      await supabase.from("users").update({ last_synced_at: null }).eq("github_login", dbKey);
    } catch { /* self-heals */ }
  }
}

async function readMentorFromDB(dbKey: string, baseQ: string): Promise<RawGitHubPR[]> {
  if (!supabase) return [];
  let all: any[] = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("pull_requests")
      .select("raw_data")
      .eq("github_login", dbKey)
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) {
      console.error("Supabase read error:", error);
      return fetchAllFromGitHub(baseQ);
    }
    all.push(...(data || []));
    if (!data || data.length < pageSize) break;
    page++;
  }
  return all.map((r: any) => r.raw_data as RawGitHubPR);
}


async function fetchPages(q: string, startPage: number, pages: number, order: "asc" | "desc"): Promise<RawGitHubPR[]> {
  const rest = await Promise.all(
    Array.from({ length: pages }, async (_, i) => {
      const pageUrl = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=100&page=${i + startPage}&sort=created&order=${order}`;
      const r = await ghFetch(pageUrl);
      if (r.status === 403 || r.status === 429) throw new Error("RATE_LIMITED");
      if (!r.ok) throw new Error(`API_ERROR:${r.status}`);
      const d = await r.json() as { items: RawGitHubPR[] };
      return d.items;
    })
  );
  const result: RawGitHubPR[] = [];
  rest.forEach((items) => result.push(...items));
  return result;
}

async function fetchAllFromGitHub(q: string): Promise<RawGitHubPR[]> {
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=100&sort=created&order=desc`;
  const res = await ghFetch(url);
  if (res.status === 403 || res.status === 429) throw new Error("RATE_LIMITED");
  if (res.status === 422 || res.status === 404) return [];
  if (!res.ok) throw new Error(`API_ERROR:${res.status}`);

  const data = await res.json() as { items: RawGitHubPR[]; total_count: number };
  const all = [...data.items];

  if (data.total_count > 100) {
    if (data.total_count > 1000) {
      if (data.total_count > 2000) {
        console.warn(`[mentor-tracker] WARNING: Query returned ${data.total_count} results, exceeding the 2000-PR limit. Some PRs will be missing. Query: ${q}`);
      }
      // ASC/DESC hack to grab up to 2000 PRs
      const [descPages, ascPages] = await Promise.all([
        fetchPages(q, 2, 9, "desc"),
        fetchPages(q, 1, 10, "asc")
      ]);
      all.push(...descPages, ...ascPages);
      
      const unique = new Map<number, RawGitHubPR>();
      all.forEach(pr => unique.set(pr.id, pr));
      return Array.from(unique.values());
    } else {
      const pages = Math.min(Math.ceil((data.total_count - 100) / 100), 9);
      const rest = await fetchPages(q, 2, pages, "desc");
      all.push(...rest);
    }
  }

  return all;
}

function repoFromUrl(repositoryUrl: string) {
  const parts = repositoryUrl.split("/");
  return {
    name: `${parts[parts.length - 2]}/${parts[parts.length - 1]}`,
    url:  `https://github.com/${parts[parts.length - 2]}/${parts[parts.length - 1]}`,
  };
}

async function _buildMentorTrackerData(username: string): Promise<MentorTrackerData> {
  const normalized = username.toLowerCase();
  if (!USERNAME_RE.test(normalized)) {
    throw new Error("USER_NOT_FOUND");
  }
  
  const [user, rawPRs] = await Promise.all([
    fetchGitHubUser(normalized),
    fetchMentorPRs(normalized),
  ]);

  // Filter: only gssoc:approved PRs in officially registered GSSoC 2026 repos
  const approvedPRs = rawPRs.filter((pr) => {
    if (!pr.labels.some((l) => l.name === "gssoc:approved")) return false;
    const parts = pr.repository_url.split("/");
    const repoKey = `${parts[parts.length - 2]}/${parts[parts.length - 1]}`.toLowerCase();
    return GSSOC_REPO_SET.has(repoKey);
  });

  const prs: MentorPR[] = approvedPRs.map((pr) => {
    const labelNames = pr.labels.map((l) => l.name);
    const labelColors: Record<string, string> = {};
    pr.labels.forEach((l) => { labelColors[l.name] = `#${l.color}`; });

    const isMerged    = !!pr.pull_request?.merged_at;
    const { name: repo, url: repoUrl } = repoFromUrl(pr.repository_url);

    const levelLabel   = labelNames.find((l) => l in MENTOR_LEVEL_SCORES) ?? null;
    const levelScore   = levelLabel ? MENTOR_LEVEL_SCORES[levelLabel] : 10;
    const qualityLabel = labelNames.find((l) => l in MENTOR_QUALITY_BONUS) ?? null;
    const qualityBonus = qualityLabel ? MENTOR_QUALITY_BONUS[qualityLabel] : 0;

    return {
      id: pr.id, number: pr.number, title: pr.title, url: pr.html_url,
      repo, repoUrl,
      state: isMerged ? "merged" : pr.state === "open" ? "open" : "closed",
      mergedAt: pr.pull_request?.merged_at ?? null,
      createdAt: pr.created_at,
      labels: labelNames, labelColors,
      levelLabel, levelScore, qualityLabel, qualityBonus,
      points: levelScore + qualityBonus,
    };
  });

  const mergedPRs = prs.filter((p) => p.state === "merged");

  return {
    user,
    prs,
    totalPoints: mergedPRs.reduce((s, p) => s + p.points, 0),
    totalPRs: mergedPRs.length,
    fetchedAt: new Date().toISOString(),
  };
}

// Cache per username for 5 minutes — shared across all requests on the same deployment
export const buildMentorTrackerData = cache(
  (username: string) => {
    const normalized = username.toLowerCase();
    if (!USERNAME_RE.test(normalized)) {
      throw new Error("USER_NOT_FOUND");
    }
    // Include username in the cache key to prevent cross-user cache pollution
    return unstable_cache(
      () => _buildMentorTrackerData(normalized),
      ["mentor-tracker-data-v2", normalized],
      { revalidate: 300 }
    )();
  }
);
