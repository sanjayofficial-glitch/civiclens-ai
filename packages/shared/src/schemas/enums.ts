import { z } from 'zod';

export const userRoleSchema = z.enum(['citizen', 'moderator', 'official']);
export type UserRole = z.infer<typeof userRoleSchema>;

export const issueStatusSchema = z.enum([
  'reported',
  'verified',
  'in_progress',
  'resolved',
  'rejected',
]);
export type IssueStatus = z.infer<typeof issueStatusSchema>;

export const issueCategorySchema = z.enum([
  'pothole',
  'streetlight',
  'water_leak',
  'garbage',
  'graffiti',
  'sidewalk',
  'other',
]);
export type IssueCategory = z.infer<typeof issueCategorySchema>;

export const issueSeveritySchema = z.enum([
  'low',
  'medium',
  'high',
  'critical',
]);
export type IssueSeverity = z.infer<typeof issueSeveritySchema>;

export const voteTypeSchema = z.enum(['upvote', 'downvote']);
export type VoteType = z.infer<typeof voteTypeSchema>;

export const notificationTypeSchema = z.enum([
  'issue_update',
  'vote',
  'comment',
  'verification',
  'assignment',
  'resolution',
  'leaderboard',
  'general',
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const leaderboardPeriodSchema = z.enum([
  'weekly',
  'monthly',
  'all_time',
]);
export type LeaderboardPeriod = z.infer<typeof leaderboardPeriodSchema>;
