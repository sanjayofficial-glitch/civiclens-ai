import { z } from 'zod';

import { timestampSchema } from './common.js';
import { leaderboardPeriodSchema } from './enums.js';

export const leaderboardEntrySchema = z.object({
  userId: z.string().min(1),
  displayName: z.string().min(1).max(100),
  photoURL: z.string().url().nullable(),
  score: z.number().int().nonnegative(),
  issuesReported: z.number().int().nonnegative(),
  issuesVerified: z.number().int().nonnegative(),
  period: leaderboardPeriodSchema,
  weekStart: timestampSchema.optional(),
  monthStart: timestampSchema.optional(),
});

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
