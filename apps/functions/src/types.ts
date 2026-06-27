export type BackendRole =
  | 'citizen'
  | 'moderator'
  | 'official'
  | 'government'
  | 'admin';

export type LeaderboardPeriod = 'weekly' | 'monthly' | 'all_time';

export interface AuthPrincipal {
  uid: string;
  role: BackendRole;
  email?: string;
  token?: Record<string, unknown>;
}

export interface IssueAnalysisResult {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  title: string;
  description: string;
  suggestedTags: string[];
  duplicateScore: number;
  safetyConcern: boolean;
}

export interface DuplicateMatch {
  issueId: string;
  score: number;
  reason: string;
}

