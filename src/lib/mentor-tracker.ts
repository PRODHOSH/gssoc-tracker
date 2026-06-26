import { unstable_cache } from "next/cache";
import { fetchGitHubUser } from "@/lib/pr-tracker";
import { GSSOC_REPO_SET } from "@/data/gssoc-repos";
import type { RawGitHubPR, GitHubUser } from "@/types/pr-tracker";

/* ── Mentor scoring ──────────────────────────────────────────── */

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

async function fetchMentorPRs(username: string): Promise<RawGitHubPR[]> {
  // Search only by mentor:USERNAME — filter for gssoc:approved locally.
  // This gives us the full set of mentored PRs so we can filter cleanly on our end.
  const q = `label:"mentor:${username}" type:pr`;
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=100&sort=created&order=desc`;
  const res = await ghFetch(url);
  if (res.status === 403 || res.status === 429) throw new Error("RATE_LIMITED");
  if (res.status === 422 || res.status === 404) return [];
  if (!res.ok) throw new Error(`API_ERROR:${res.status}`);

  const data = await res.json() as { items: RawGitHubPR[]; total_count: number };
  const all = [...data.items];

  if (data.total_count > 100) {
    const pages = Math.min(Math.ceil((data.total_count - 100) / 100), 9);
    const rest = await Promise.all(
      Array.from({ length: pages }, async (_, i) => {
        const pageUrl = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=100&page=${i + 2}&sort=created&order=desc`;
        const r = await ghFetch(pageUrl);
        if (!r.ok) return [] as RawGitHubPR[];
        const d = await r.json() as { items: RawGitHubPR[] };
        return d.items;
      })
    );
    rest.forEach((items) => all.push(...items));
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
export const buildMentorTrackerData = (username: string) => {
  const u = username.toLowerCase();
  return unstable_cache(
    async () => _buildMentorTrackerData(u),
    ["mentor-tracker-data", u],
    { revalidate: 300 }
  )();
};
