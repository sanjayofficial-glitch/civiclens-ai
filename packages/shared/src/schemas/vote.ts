import { z } from 'zod';

import { timestampSchema } from './common.js';
import { voteTypeSchema } from './enums.js';

export const voteSchema = z.object({
  issueId: z.string().min(1),
  userId: z.string().min(1),
  type: voteTypeSchema,
  createdAt: timestampSchema,
});

export const createVoteSchema = voteSchema.omit({
  createdAt: true,
});

export type Vote = z.infer<typeof voteSchema>;
export type CreateVote = z.infer<typeof createVoteSchema>;
