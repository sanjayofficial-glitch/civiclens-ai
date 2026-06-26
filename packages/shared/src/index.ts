export * from './constants/index.js';

// The Zod schemas (./schemas) are the source of truth for domain types and
// already export User, Issue, Vote, Comment, Notification, LeaderboardEntry,
// the Issue* sub-types, and all enum unions. `./types/domain.ts` mirrors those
// same names, so we cannot `export *` from both without TS2308 collisions.
// We therefore re-export the schemas first, then pull in the remaining
// API/utility types that only live under ./types (api.ts) plus the canonical
// domain interfaces — the latter explicitly, which is safe because they are
// structurally identical to their schema equivalents.
export * from './schemas/index.js';

export type {
  ApiResponse,
  ApiError,
  ApiResult,
  PaginatedResult,
} from './types/api.js';
export type {
  FirestoreTimestamp,
  TimestampInput,
  GeoPoint,
} from './types/domain.js';
