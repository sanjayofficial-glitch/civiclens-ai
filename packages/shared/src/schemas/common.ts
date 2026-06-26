import { z } from 'zod';

/** Serialized Firestore Timestamp shape (client SDK). */
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

/** Admin SDK / legacy Firestore Timestamp shape. */
export interface FirestoreTimestampLegacy {
  _seconds: number;
  _nanoseconds: number;
}

export type TimestampInput =
  | Date
  | string
  | FirestoreTimestamp
  | FirestoreTimestampLegacy;

const firestoreTimestampSchema = z.object({
  seconds: z.number().int().nonnegative(),
  nanoseconds: z.number().int().min(0).max(999_999_999),
});

const firestoreTimestampLegacySchema = z.object({
  _seconds: z.number().int().nonnegative(),
  _nanoseconds: z.number().int().min(0).max(999_999_999),
});

/** Accepts ISO strings, Date objects, and Firestore Timestamp objects. */
export const timestampSchema = z.union([
  z.string().datetime(),
  z.date(),
  firestoreTimestampSchema,
  firestoreTimestampLegacySchema,
]);

export const geoPointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type GeoPoint = z.infer<typeof geoPointSchema>;

export function isFirestoreTimestamp(
  value: unknown,
): value is FirestoreTimestamp | FirestoreTimestampLegacy {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    (typeof record['seconds'] === 'number' &&
      typeof record['nanoseconds'] === 'number') ||
    (typeof record['_seconds'] === 'number' &&
      typeof record['_nanoseconds'] === 'number')
  );
}

export function timestampToDate(value: TimestampInput): Date {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string') {
    return new Date(value);
  }

  if ('seconds' in value) {
    return new Date(value.seconds * 1000 + value.nanoseconds / 1_000_000);
  }

  return new Date(value._seconds * 1000 + value._nanoseconds / 1_000_000);
}

export function dateToTimestamp(date: Date): FirestoreTimestamp {
  const ms = date.getTime();
  return {
    seconds: Math.floor(ms / 1000),
    nanoseconds: (ms % 1000) * 1_000_000,
  };
}

export function timestampToIso(value: TimestampInput): string {
  return timestampToDate(value).toISOString();
}

/** Normalizes any accepted timestamp input to an ISO-8601 string. */
export const normalizedTimestampSchema = timestampSchema.transform(
  timestampToIso,
);
