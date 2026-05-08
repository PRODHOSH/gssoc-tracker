/**
 * In-memory participant cache.
 * Fetches the full GSSoC API once, caches for 30 min.
 * All user lookups share the same cached list — no repeated 10 MB fetches.
 */
import { ProfileSnapshot } from "@/types";

const GSSOC_API  = "https://gssoc.girlscript.org/api/leaderboard";
const CACHE_TTL  = 30 * 60 * 1000;   // 30 minutes
const TIMEOUT_MS = 120_000;

interface CacheEntry {
  list: ProfileSnapshot[];
  ts: number;
}

// Module-level cache (persists across requests in the same Node process)
let _cache: CacheEntry | null = null;

type RawP = Record<string, unknown>;

function normalize(raw: RawP, i: number): ProfileSnapshot {
  const github_id = String(raw.github_user ?? raw.login ?? raw.username ?? "");
  return {
    timestamp:     new Date().toISOString(),
    rank:          Number(raw.rank ?? i + 1),
    score:         Number(raw.score ?? 0),
    role_scores:   (raw.roleScores as Record<string, number>) ?? {},
    name:          String(raw.full_name ?? raw.name ?? github_id),
    github_id,
    avatar_url:    github_id
                     ? `https://avatars.githubusercontent.com/${github_id}`
                     : "",
    college:       String(raw.college ?? ""),
    city:          String(raw.city ?? ""),
    accepted_roles: (raw.accepted_roles as string[]) ?? [],
    tracks:        (raw.tracks as string[]) ?? [],
    tech_stack:    (raw.tech_stack as string[]) ?? [],
    breakdown:     (raw.breakdown as ProfileSnapshot["breakdown"]) ?? [],
    linkedin_url:  raw.linkedin_url as string | undefined,
  };
}

async function fetchAll(): Promise<ProfileSnapshot[]> {
  const ac = new AbortController();
  const t  = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(GSSOC_API, {
      headers: {
        Accept: "application/json",
        "User-Agent": "GSSoC-Tracker/1.0 (multi-user-dashboard)",
      },
      signal: ac.signal,
    });
    if (!res.ok) throw new Error(`GSSoC API ${res.status}`);
    const raw = await res.json() as { participants?: RawP[] } | RawP[];
    const list: RawP[] = Array.isArray(raw)
      ? raw
      : (raw as { participants?: RawP[] }).participants ?? [];
    return list.map((p, i) => normalize(p, i));
  } finally {
    clearTimeout(t);
  }
}

async function getList(): Promise<ProfileSnapshot[]> {
  if (_cache && Date.now() - _cache.ts < CACHE_TTL) return _cache.list;
  const list = await fetchAll();
  _cache = { list, ts: Date.now() };
  return list;
}

export async function findParticipant(githubId: string): Promise<ProfileSnapshot | null> {
  const list = await getList();
  return (
    list.find(p => p.github_id.toLowerCase() === githubId.toLowerCase()) ?? null
  );
}

export async function getTotalParticipants(): Promise<number> {
  const list = await getList();
  return list.length;
}
