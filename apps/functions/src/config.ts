export const REGION = 'us-central1';

export const GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() ?? 'gemini-1.5-flash';

export const GEMINI_TIMEOUT_MS = Number(
  process.env.GEMINI_TIMEOUT_MS ?? 20_000,
);

export const GEMINI_MAX_RETRIES = Number(process.env.GEMINI_MAX_RETRIES ?? 2);

export const DEFAULT_REPUTATION = {
  ISSUE_REPORTED: 5,
  ISSUE_VERIFIED: 8,
  COMMENT_CREATED: 1,
  UPVOTE_CAST: 2,
  DOWNVOTE_CAST: -1,
  ISSUE_RESOLVED: 15,
} as const;
