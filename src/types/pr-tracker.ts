export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  bio: string | null;
  location: string | null;
  company: string | null;
  created_at: string;
}

export interface PRLabel {
  name: string;
  color: string;
}

export interface RawGitHubPR {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: "open" | "closed";
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  repository_url: string;
  labels: PRLabel[];
  pull_request?: {
    merged_at: string | null;
    url: string;
  };
}

export interface TrackedPR {
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
  isGSSoC: boolean;
  isValid: boolean;
  difficulty: string | null;
  difficultyScore: number;
  quality: string | null;
  qualityMultiplier: number;
  typeBonuses: string[];
  typeBonusTotal: number;
  points: number;
  disqualifiedReason?: string;
}

export type PRRank =
  | "Beginner Contributor"
  | "Active Contributor"
  | "Advanced Contributor"
  | "Elite Contributor"
  | "GSSoC Legend";

export interface PRTrackerData {
  user: GitHubUser;
  allPRs: TrackedPR[];
  validPRs: TrackedPR[];
  totalPoints: number;
  totalMergedGSSoC: number;
  totalApproved: number;
  uniqueRepos: number;
  streak: number;
  rank: PRRank;
  fetchedAt: string;
}

export interface PRTrackerError {
  error: string;
  code?: "USER_NOT_FOUND" | "RATE_LIMITED" | "INVALID_USERNAME" | "API_ERROR";
}
