import { db, FieldValue } from '../lib/firebase';

export async function recordAnalyticsEvent(
  docId: string,
  scope: string,
  metrics: Record<string, number>,
) {
  const updates = Object.entries(metrics).reduce<Record<string, unknown>>(
    (acc, [metric, value]) => {
      acc[`metrics.${metric}`] = FieldValue.increment(value);
      return acc;
    },
    {},
  );

  await db.collection('analytics').doc(docId).set(
    {
      key: docId,
      scope,
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

