import { onCall } from 'firebase-functions/v2/https';
import { z } from 'zod';

import { assertAuth, fail } from '../lib/errors';
import { parseInput } from '../lib/validation';
import { isPrivilegedRole, normalizeRole } from '../services/authService';
import { rebuildLeaderboard } from '../services/leaderboardService';

const schema = z.object({
  period: z.enum(['weekly', 'monthly', 'all_time']).default('all_time'),
});

export const updateLeaderboard = onCall(async (request) => {
  assertAuth(request.auth);

  const role = normalizeRole((request.auth.token as { role?: unknown }).role);
  if (!isPrivilegedRole(role)) {
    fail('permission-denied', 'Only moderators and admins can rebuild leaderboards.');
  }

  const input = parseInput<{ period: 'weekly' | 'monthly' | 'all_time' }>(
    schema,
    request.data ?? {},
  );

  await rebuildLeaderboard(input.period);

  return {
    status: 'success',
    period: input.period,
  };
});
