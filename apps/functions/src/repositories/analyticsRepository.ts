import { FieldValue } from '../lib/firebase';
import { BaseRepository } from './baseRepository';

export interface AnalyticsBucketRecord {
  key: string;
  scope: string;
  metrics: Record<string, number>;
  updatedAt: FirebaseFirestore.Timestamp;
}

export class AnalyticsRepository extends BaseRepository<AnalyticsBucketRecord> {
  constructor() {
    super('analytics');
  }

  async incrementBucket(
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

    await this.doc(docId).set(
      {
        key: docId,
        scope,
        ...updates,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }
}

