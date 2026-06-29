import { onCall } from 'firebase-functions/v2/https';
import { z } from 'zod';

import { REGION } from '../config';
import { assertAuth } from '../lib/errors';
import { parseInput } from '../lib/validation';
import { registerVote } from '../services/verificationService';

const schema = z.object({
  issueId: z.string().min(1),
  type: z.enum(['upvote', 'downvote']),
});

export const submitVote = onCall({ region: REGION }, async (request) => {
  assertAuth(request.auth);
  const input = parseInput<{ issueId: string; type: 'upvote' | 'downvote' }>(
    schema,
    request.data ?? {},
  );

  await registerVote({
    issueId: input.issueId,
    userId: request.auth.uid,
    type: input.type,
  });

  return { status: 'success' };
});
