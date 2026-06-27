export const APP_NAME = 'blockseblock' as const;

export const FIREBASE_REGION = 'us-central1' as const;

export const COLLECTIONS = {
  USERS: 'users',
  ISSUES: 'issues',
  VOTES: 'votes',
  COMMENTS: 'comments',
  NOTIFICATIONS: 'notifications',
  LEADERBOARD: 'leaderboard',
  ANALYTICS: 'analytics',
  BADGES: 'badges',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const USER_ROLES = ['citizen', 'moderator', 'official'] as const;

export const ISSUE_STATUSES = [
  'reported',
  'verified',
  'in_progress',
  'resolved',
  'rejected',
] as const;

export const ISSUE_CATEGORIES = [
  'pothole',
  'streetlight',
  'water_leak',
  'garbage',
  'graffiti',
  'sidewalk',
  'other',
] as const;

export const ISSUE_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;

export const VOTE_TYPES = ['upvote', 'downvote'] as const;

export const LEADERBOARD_PERIODS = ['weekly', 'monthly', 'all_time'] as const;
