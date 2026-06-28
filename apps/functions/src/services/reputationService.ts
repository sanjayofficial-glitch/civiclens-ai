import { FieldValue, db } from '../lib/firebase';
import { updateLeaderboardStats } from './leaderboardService';

export async function adjustReputation(uid: string, delta: number) {
  await db
    .collection('users')
    .doc(uid)
    .set(
      {
        reputation: FieldValue.increment(delta),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

  await updateLeaderboardStats(uid, { score: delta });
}
