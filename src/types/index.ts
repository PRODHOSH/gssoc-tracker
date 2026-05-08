export interface ScoreBreakdown {
  label: string;
  pts: number;
  role: string;
}

export interface ProfileSnapshot {
  timestamp: string;
  rank: number;
  score: number;
  role_scores: Record<string, number>;
  name: string;
  github_id: string;
  avatar_url: string;
  college: string;
  city: string;
  accepted_roles: string[];
  tracks: string[];
  tech_stack: string[];
  breakdown: ScoreBreakdown[];
  linkedin_url?: string;
  applied_at?: string;
}

export interface HistoryEntry {
  timestamp: string;
  rank: number;
  score: number;
  role_scores: Record<string, number>;
  rank_change: number;    // negative = rank improved (moved up)
  score_change: number;   // positive = gained points
}

export interface NotificationLog {
  timestamp: string;
  type: "change_alert" | "daily_digest";
  subject: string;
  email_sent: boolean;
  changes?: {
    rank_before: number;
    rank_after: number;
    score_before: number;
    score_after: number;
  };
}

export interface StoredData {
  profile: ProfileSnapshot | null;
  history: HistoryEntry[];
  notifications: NotificationLog[];
}
