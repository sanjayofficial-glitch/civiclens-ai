import { FieldValue } from '../lib/firebase';
import { DEFAULT_REPUTATION } from '../config';
import { LeaderboardRepository } from '../repositories/leaderboardRepository';
import { db } from '../lib/firebase';

const leaderboard = new LeaderboardRepository();

function periodWindow(period: 'weekly' | 'monthly' | 'all_time') {
  const now = new Date();
  if (period === 'weekly') {
    now.setDate(now.getDate() - 7);
  } else if (period === 'monthly') {
    now.setMonth(now.getMonth() - 1);
  } else {
    now.setFullYear(1970);
  }

  return now;
}

export async function rebuildLeaderboard(period: 'weekly' | 'monthly' | 'all_time') {
  const start = periodWindow(period);
  const usersSnapshot = await db.collection('users').get();
  const issuesSnapshot = await db.collection('issues').get();

  const issueCounts = new Map<string, { reported: number; verified: number }>();

  issuesSnapshot.forEach((doc) => {
    const data = doc.data();
    const createdAt = data.createdAt?.toDate?.() ?? new Date(0);
    if (createdAt < start && period !== 'all_time') {
      return;
    }

    const stats = issueCounts.get(String(data.reporterId)) ?? { reported: 0, verified: 0 };
    stats.reported += 1;
    if ((data.status === 'verified' || data.status === 'resolved') && Array.isArray(data.verification?.verifiedBy) && data.verification.verifiedBy.length > 0) {
      stats.verified += 1;
    }
    issueCounts.set(String(data.reporterId), stats);
  });

  const batch = db.batch();
  const now = FieldValue.serverTimestamp();

  usersSnapshot.forEach((doc) => {
    const data = doc.data();
    const stats = issueCounts.get(doc.id) ?? { reported: 0, verified: 0 };
    const score =
      stats.reported * DEFAULT_REPUTATION.ISSUE_REPORTED +
      stats.verified * DEFAULT_REPUTATION.ISSUE_VERIFIED +
      Number(data.reputation ?? 0);

    const record = {
      userId: doc.id,
      displayName: String(data.displayName ?? 'Anonymous'),
      photoURL: data.photoURL ?? null,
      score,
      issuesReported: stats.reported,
      issuesVerified: stats.verified,
      period,
      updatedAt: now,
    };

    batch.set(leaderboard.doc(`${period}_${doc.id}`), record, { merge: true });
  });

  await batch.commit();
}

