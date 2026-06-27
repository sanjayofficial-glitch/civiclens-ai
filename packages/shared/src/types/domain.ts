import type { GeoPoint, FirestoreTimestamp, TimestampInput } from '../schemas/common.js';
import type {
  IssueCategory,
  IssueSeverity,
  IssueStatus,
  LeaderboardPeriod,
  NotificationType,
  UserRole,
  VoteType,
} from '../schemas/enums.js';

export type { GeoPoint, FirestoreTimestamp, TimestampInput };

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  phoneNumber: string | null;
  role: UserRole;
  reputation: number;
  issuesReported: number;
  issuesVerified: number;
  badges: string[];
  streakDays: number;
  lastActive: TimestampInput;
  location?: GeoPoint;
  fcmTokens: string[];
  createdAt: TimestampInput;
  updatedAt: TimestampInput;
}

export interface IssueLocation {
  geohash: string;
  geopoint: GeoPoint;
  address: string;
}

export interface IssueMedia {
  images: string[];
  videos: string[];
  thumbnail?: string;
}

export interface IssueAiAnalysis {
  category: IssueCategory;
  severity: IssueSeverity;
  confidence: number;
  suggestedTitle: string;
  suggestedDescription: string;
  suggestedTags: string[];
  duplicateProbability: number;
}

export interface IssueVerification {
  upvotes: number;
  downvotes: number;
  verifiedBy: string[];
  verifiedAt?: TimestampInput;
}

export interface IssueResolution {
  resolvedAt: TimestampInput;
  resolvedBy: string;
  resolutionNotes: string;
  beforeAfterPhotos: string[];
}

export interface Issue {
  id: string;
  reporterId: string;
  status: IssueStatus;
  category: IssueCategory;
  severity: IssueSeverity;
  title: string;
  description: string;
  location: IssueLocation;
  media: IssueMedia;
  aiAnalysis?: IssueAiAnalysis;
  verification: IssueVerification;
  assignedTo?: string;
  resolution?: IssueResolution;
  tags: string[];
  createdAt: TimestampInput;
  updatedAt: TimestampInput;
}

export interface Vote {
  issueId: string;
  userId: string;
  type: VoteType;
  createdAt: TimestampInput;
}

export interface Comment {
  issueId: string;
  userId: string;
  text: string;
  createdAt: TimestampInput;
}

export interface Notification {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: TimestampInput;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL: string | null;
  score: number;
  issuesReported: number;
  issuesVerified: number;
  period: LeaderboardPeriod;
  weekStart?: TimestampInput;
  monthStart?: TimestampInput;
}

export type {
  UserRole,
  IssueStatus,
  IssueCategory,
  IssueSeverity,
  VoteType,
  NotificationType,
  LeaderboardPeriod,
} from '../schemas/enums.js';

export type {
  CreateUser,
  UpdateUser,
} from '../schemas/user.js';

export type {
  CreateIssue,
  UpdateIssue,
} from '../schemas/issue.js';

export type { CreateVote } from '../schemas/vote.js';
export type { CreateComment } from '../schemas/comment.js';
export type { CreateNotification } from '../schemas/notification.js';
