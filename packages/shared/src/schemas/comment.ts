import { z } from 'zod';

import { timestampSchema } from './common.js';

export const commentSchema = z.object({
  issueId: z.string().min(1),
  userId: z.string().min(1),
  text: z.string().min(1).max(2000),
  createdAt: timestampSchema,
});

export const createCommentSchema = commentSchema.omit({
  createdAt: true,
});

export type Comment = z.infer<typeof commentSchema>;
export type CreateComment = z.infer<typeof createCommentSchema>;
