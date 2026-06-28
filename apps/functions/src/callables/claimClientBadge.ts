import { onCall } from 'firebase-functions/v2/https';
import { z } from 'zod';

import { assertAuth } from '../lib/errors';
import { parseInput } from '../lib/validation';
import { awardBadge } from '../services/badgeService';

const schema = z.object({
  badgeId: z.enum(['streak-7', 'map-explorer']),
});

export const claimClientBadge = onCall(async (request) => {
  assertAuth(request.auth);
  const input = parseInput<{ badgeId: 'streak-7' | 'map-explorer' }>(
    schema,
    request.data ?? {},
  );

  await awardBadge(request.auth.uid, input.badgeId);

  return {
    status: 'success',
    badgeId: input.badgeId,
  };
});
