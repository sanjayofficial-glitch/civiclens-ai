import type { AuthPrincipal } from '../types';

import { onCall } from 'firebase-functions/v2/https';
import { z } from 'zod';

import { REGION } from '../config';
import { assertAuth } from '../lib/errors';
import { parseInput } from '../lib/validation';
import { ensureBackendProfile } from '../services/authService';

const schema = z.object({
  role: z
    .enum(['citizen', 'moderator', 'official', 'government', 'admin'])
    .optional(),
});

export const syncAuthProfile = onCall({ region: REGION }, async (request) => {
  assertAuth(request.auth);
  const input = parseInput<{
    role?: 'citizen' | 'moderator' | 'official' | 'government' | 'admin';
  }>(schema, request.data ?? {});

  const principal: AuthPrincipal = {
    uid: request.auth.uid,
    role: input.role ?? 'citizen',
    email: request.auth.token.email,
    token: request.auth.token,
  };

  const profile = await ensureBackendProfile(principal);

  return {
    status: 'success',
    profile,
  };
});
