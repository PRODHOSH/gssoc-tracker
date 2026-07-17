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

  if (!supabase) {
    return fetchAllFromGitHub(baseQ);
  }

  // Use a namespaced key so mentor and contributor timestamps never collide
  const dbKey = `mentor:${username}`;

  const { data: userRow } = await supabase
    .from("users")
    .select("last_synced_at")
    .eq("github_login", dbKey)
    .single();

  const now = new Date();
  const lastSyncStr = userRow?.last_synced_at;
  const lastSync = lastSyncStr ? new Date(lastSyncStr) : null;
  const timeSinceSync = lastSync ? now.getTime() - lastSync.getTime() : Infinity;

  // 1 minute cache for near-instant updates while preventing rate limit crashes
  if (timeSinceSync > 1 * 60 * 1000) {
    const isFullSync = !lastSync || timeSinceSync > 24 * 60 * 60 * 1000;
    let q = baseQ;

    if (!isFullSync) {
      // Subtract 10 minutes to overlap the search window, catching GitHub indexing delays
      const overlapTime = new Date(lastSync!.getTime() - 10 * 60 * 1000);
      q += ` updated:>${overlapTime.toISOString()}`;
    }

    // Stampede lock: set timestamp 2 min in the future to block concurrent requests.
    // If everything fails, this lock naturally expires and the system self-heals.
    const lockTime = new Date(now.getTime() + 2 * 60 * 1000);
    await supabase.from("users").upsert({ github_login: dbKey, last_synced_at: lockTime.toISOString() });

    try {
      const deltaPRs = await fetchAllFromGitHub(q);

      // Full baseline sync: wipe existing PRs to purge stale data (e.g. removed labels)
      if (isFullSync) {
        await supabase.from("pull_requests").delete().eq("github_login", dbKey);
      }

      // Upsert fetched PRs into the database
      if (deltaPRs.length > 0) {
        const payload = deltaPRs.map((pr) => ({
          id: pr.id,
          github_login: dbKey,
          raw_data: pr,
          updated_at: pr.updated_at
        }));

        for (let i = 0; i < payload.length; i += 100) {
          await supabase.from("pull_requests").upsert(payload.slice(i, i + 100), { onConflict: 'id' });
        }
      }

      // Everything succeeded: set the real timestamp
      await supabase.from("users").update({ last_synced_at: now.toISOString() }).eq("github_login", dbKey);
    } catch (err: any) {
      console.warn(`[mentor-tracker] Sync failed for ${username}, falling back to DB:`, err.message);
      // Best-effort: roll back the lock so it retries next time.
      // If this also fails, the lock expires in 2 minutes anyway.
      try {
        if (lastSync) {
          await supabase.from("users").update({ last_synced_at: lastSync.toISOString() }).eq("github_login", dbKey);
        } else {
          await supabase.from("users").delete().eq("github_login", dbKey);
        }
      } catch { /* lock will self-heal in 2 minutes */ }
    }
  }

  // Read mentor PRs from the database using the namespaced key
  const { data: dbPRs, error } = await supabase
    .from("pull_requests")
    .select("raw_data")
    .eq("github_login", dbKey);
    
  if (error) {
     console.error("Supabase error:", error);
     return fetchAllFromGitHub(baseQ);
  }

  return dbPRs.map((row: any) => row.raw_data as RawGitHubPR);
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
  unstable_cache(
    _buildMentorTrackerData,
    ["mentor-tracker-data"],
    { revalidate: 300 }
  )
);
