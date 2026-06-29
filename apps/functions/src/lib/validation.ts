import type { ZodTypeAny } from 'zod';

import { fail } from './errors';

export function parseInput<T>(schema: ZodTypeAny, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    fail(
      'invalid-argument',
      'Invalid request payload.',
      result.error.flatten(),
    );
  }
  return result.data as T;
}
