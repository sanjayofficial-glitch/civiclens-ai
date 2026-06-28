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

  await db
    .collection('analytics')
    .doc(docId)
    .set(
      {
        key: docId,
        scope,
        ...updates,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}

export function dailyDocId(date?: Date): string {
  const d = date ?? new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `daily_${String(y)}-${m}-${day}`;
}

export async function recordDailyMetrics(
  metrics: Record<string, number>,
  date?: Date,
) {
  await recordAnalyticsEvent(dailyDocId(date), 'daily', metrics);
}

export async function recordCategoryMetrics(category: string) {
  await recordAnalyticsEvent(`category_${category}`, 'category', {
    reportCount: 1,
  });
}

export async function recordStatusMetrics(status: string) {
  await recordAnalyticsEvent(`status_${status}`, 'status', {
    issueCount: 1,
  });
}
