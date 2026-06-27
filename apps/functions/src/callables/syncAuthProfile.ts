import { onCall } from 'firebase-functions/v2/https';

import { assertAuth, fail } from '../lib/errors';
import { parseInput } from '../lib/validation';
import { z } from 'zod';
import { ensureBackendProfile } from '../services/authService';
import type { AuthPrincipal } from '../types';

const schema = z.object({
  role: z.enum(['citizen', 'moderator', 'official', 'government', 'admin']).optional(),
});

export const syncAuthProfile = onCall(async (request) => {
  assertAuth(request.auth);
  const input = parseInput<{ role?: 'citizen' | 'moderator' | 'official' | 'government' | 'admin' }>(
    schema,
    request.data ?? {},
  );

  const principal: AuthPrincipal = {
    uid: request.auth.uid,
    role: input.role ?? 'citizen',
    email: request.auth.token.email,
    token: request.auth.token as Record<string, unknown>,
  };

  const profile = await ensureBackendProfile(principal);
  if (!profile) {
    fail('internal', 'Unable to synchronize profile.');
  }

  return {
    status: 'success',
    profile,
  };
});
