import { FieldValue } from '../lib/firebase';
import { BaseRepository } from './baseRepository';

export interface BackendLeaderboardRecord {
  userId: string;
  displayName: string;
  photoURL: string | null;
  score: number;
  issuesReported: number;
  issuesVerified: number;
  period: 'weekly' | 'monthly' | 'all_time';
  weekStart?: FirebaseFirestore.Timestamp;
  monthStart?: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export class LeaderboardRepository extends BaseRepository<BackendLeaderboardRecord> {
  constructor() {
    super('leaderboard');
  }

  async upsert(id: string, data: Omit<BackendLeaderboardRecord, 'updatedAt'>) {
    await this.doc(id).set(
      {
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }
}

