import { HttpsError } from 'firebase-functions/v2/https';

export function fail(
  code:
    | 'invalid-argument'
    | 'unauthenticated'
    | 'permission-denied'
    | 'not-found'
    | 'aborted'
    | 'internal'
    | 'failed-precondition'
    | 'deadline-exceeded'
    | 'resource-exhausted'
    | 'unavailable',
  message: string,
  details?: unknown,
): never {
  throw new HttpsError(code, message, details);
}

export function assertAuth<T extends { uid?: string }>(
  auth: T | null | undefined,
): asserts auth is T & { uid: string } {
  if (!auth || !auth.uid) {
    fail('unauthenticated', 'You must be signed in to call this function.');
  }
}
