import { unstable_cache } from "next/cache";

export interface AdminScoreBreakdown {
  repoName: string;
  mergedPRsCount: number;       // count of merged gssoc:approved PRs
  mergedPRsPoints: number;      // mergedPRsCount * 15
  labeledIssuesFullCount: number; // difficulty + type
  labeledIssuesFullPoints: number; // count * 10
  labeledIssuesDiffCount: number; // difficulty only
  labeledIssuesDiffPoints: number; // count * 5
  openedIssuesBeginnerCount: number; // good first issue/level:beginner by admin
  openedIssuesBeginnerPoints: number; // count * 8
  openedIssuesOtherCount: number;    // other issues opened by admin
  openedIssuesOtherPoints: number;    // count * 3
  
  // Issue resolution boost
  closedIssuesForBoost: number;
  avgResolutionDays: number | null;
  resolutionBoostPoints: number; // 60 / 40 / 20 / 0
  
  // Totals
  ongoingTotal: number;
  total: number; // ongoingTotal + resolutionBoostPoints
}

async function ghFetch(url: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GH_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(url, { headers, cache: "no-store" });
}

async function fetchRepoPRs(owner: string, repo: string): Promise<any[]> {
  const q = `label:"gssoc:approved" repo:${owner}/${repo} type:pr`;
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=100&sort=created&order=desc`;
  const res = await ghFetch(url);
  if (res.status === 403 || res.status === 429) throw new Error("RATE_LIMITED");
  if (res.status === 422 || res.status === 404) return [];
  if (!res.ok) throw new Error(`API_ERROR:${res.status}`);

  const data = await res.json() as { items: any[]; total_count: number };
  const all = [...data.items];

  if (data.total_count > 100) {
    const max = Math.min(data.total_count, 1000);
    const pages = Math.min(Math.ceil((max - 100) / 100), 9); // fetch up to 1,000 results (Search API cap)
    const rest = await Promise.all(
      Array.from({ length: pages }, async (_, i) => {
        const pageUrl = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=100&page=${i + 2}&sort=created&order=desc`;
        const r = await ghFetch(pageUrl);
        if (r.status === 403 || r.status === 429) throw new Error("RATE_LIMITED");
        if (r.status === 422 || r.status === 404) return [];
        if (!r.ok) throw new Error(`API_ERROR:${r.status}`);
        const d = await r.json() as { items: any[] };
        return d.items;
      })
    );
    rest.forEach((items) => all.push(...items));
  }

  return all;
}

async function fetchRepoIssues(owner: string, repo: string): Promise<any[]> {
  const q = `repo:${owner}/${repo} type:issue`;
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=100&sort=created&order=desc`;
  const res = await ghFetch(url);
  if (res.status === 403 || res.status === 429) throw new Error("RATE_LIMITED");
  if (res.status === 422 || res.status === 404) return [];
  if (!res.ok) throw new Error(`API_ERROR:${res.status}`);

  const data = await res.json() as { items: any[]; total_count: number };
  const all = [...data.items];

  if (data.total_count > 100) {
    const max = Math.min(data.total_count, 1000);
    const pages = Math.min(Math.ceil((max - 100) / 100), 9); // fetch up to 1,000 results (Search API cap)
    const rest = await Promise.all(
      Array.from({ length: pages }, async (_, i) => {
        const pageUrl = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=100&page=${i + 2}&sort=created&order=desc`;
        const r = await ghFetch(pageUrl);
        if (r.status === 403 || r.status === 429) throw new Error("RATE_LIMITED");
        if (r.status === 422 || r.status === 404) return [];
        if (!r.ok) throw new Error(`API_ERROR:${r.status}`);
        const d = await r.json() as { items: any[] };
        return d.items;
      })
    );
    rest.forEach((items) => all.push(...items));
  }

  return all;
}

export async function _buildAdminScore(owner: string, repo: string, adminUsername: string): Promise<AdminScoreBreakdown> {
  const [prs, issues] = await Promise.all([
    fetchRepoPRs(owner, repo),
    fetchRepoIssues(owner, repo),
  ]);

  // 1. Merged PRs with gssoc:approved
  // Note: search issues item has `pull_request` and `pull_request.merged_at` check
  const mergedPRsCount = prs.filter((pr) => !!pr.pull_request?.merged_at || pr.state === "closed").length; 
  const mergedPRsPoints = mergedPRsCount * 15;

  // 2. Labeled issues
  // NOTE on Rate Limiting: Ideally, we would check the GitHub Issue Events API to see exactly
  // who applied each label. However, doing so requires making a separate API call for every single issue,
  // which would easily trigger GitHub rate limits and cause severe latency. Instead, we scan all GSSoC issues
  // in the repository. Since only admins and authorized mentors have write access to apply labels,
  // this repository-wide check is a highly efficient and rate-limit safe proxy.
  let labeledIssuesFullCount = 0;
  let labeledIssuesDiffCount = 0;

  // 3. Opened issues
  let openedIssuesBeginnerCount = 0;
  let openedIssuesOtherCount = 0;

  // 4. Resolution boost details
  let closedIssuesForBoost = 0;
  let totalResolutionTimeMs = 0;

  issues.forEach((issue) => {
    const labelNames = (issue.labels || []).map((l: any) => l.name.toLowerCase());
    
    // Check difficulty: starts with level:
    const hasDifficulty = labelNames.some((name: string) => name.startsWith("level:"));
    // Check type: starts with type:
    const hasType = labelNames.some((name: string) => name.startsWith("type:"));

    if (hasDifficulty && hasType) {
      labeledIssuesFullCount++;
    } else if (hasDifficulty) {
      labeledIssuesDiffCount++;
    }

    // Check if opened by admin
    if (issue.user?.login?.toLowerCase() === adminUsername.toLowerCase()) {
      const isBeginnerFriendly = labelNames.some((name: string) => 
        name === "good first issue" || name === "level:beginner" || name.includes("beginner")
      );
      if (isBeginnerFriendly) {
        openedIssuesBeginnerCount++;
      } else {
        openedIssuesOtherCount++;
      }
    }

    // Resolution boost: closed issues
    if (issue.state === "closed" && issue.closed_at && issue.created_at) {
      closedIssuesForBoost++;
      const created = new Date(issue.created_at).getTime();
      const closed = new Date(issue.closed_at).getTime();
      totalResolutionTimeMs += Math.max(0, closed - created);
    }
  });

  const labeledIssuesFullPoints = labeledIssuesFullCount * 10;
  const labeledIssuesDiffPoints = labeledIssuesDiffCount * 5;
  const openedIssuesBeginnerPoints = openedIssuesBeginnerCount * 8;
  const openedIssuesOtherPoints = openedIssuesOtherCount * 3;

  const avgResolutionDays = closedIssuesForBoost >= 2 
    ? (totalResolutionTimeMs / (1000 * 60 * 60 * 24)) / closedIssuesForBoost
    : null;

  let resolutionBoostPoints = 0;
  if (avgResolutionDays !== null && closedIssuesForBoost >= 2) {
    if (avgResolutionDays <= 2) {
      resolutionBoostPoints = 60;
    } else if (avgResolutionDays <= 5) {
      resolutionBoostPoints = 40;
    } else if (avgResolutionDays <= 10) {
      resolutionBoostPoints = 20;
    }
  }

  const ongoingTotal = mergedPRsPoints + labeledIssuesFullPoints + labeledIssuesDiffPoints + openedIssuesBeginnerPoints + openedIssuesOtherPoints;
  const total = ongoingTotal + resolutionBoostPoints;

  return {
    repoName: `${owner}/${repo}`,
    mergedPRsCount,
    mergedPRsPoints,
    labeledIssuesFullCount,
    labeledIssuesFullPoints,
    labeledIssuesDiffCount,
    labeledIssuesDiffPoints,
    openedIssuesBeginnerCount,
    openedIssuesBeginnerPoints,
    openedIssuesOtherCount,
    openedIssuesOtherPoints,
    closedIssuesForBoost,
    avgResolutionDays,
    resolutionBoostPoints,
    ongoingTotal,
    total,
  };
}

export const buildAdminScore = (owner: string, repo: string, adminUsername: string) => {
  const o = owner.toLowerCase();
  const r = repo.toLowerCase();
  const u = adminUsername.toLowerCase();
  return unstable_cache(
    async () => _buildAdminScore(o, r, u),
    ["admin-scoring-data-v2", o, r, u],
    { revalidate: 300 }
  )();
};
