import { DEFAULT_REPUTATION } from '../config';
import { FieldValue, db } from '../lib/firebase';
import { LeaderboardRepository } from '../repositories/leaderboardRepository';

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

export async function rebuildLeaderboard(
  period: 'weekly' | 'monthly' | 'all_time',
) {
  const start = periodWindow(period);
  const usersSnapshot = await db.collection('users').get();
  const issuesSnapshot = await db.collection('issues').get();

  const issueCounts = new Map<string, { reported: number; verified: number }>();

  issuesSnapshot.forEach((doc) => {
    const data = doc.data() as Record<string, unknown>;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const createdAt =
      (data.createdAt as Record<string, unknown> | undefined)?.toDate?.() ??
      new Date(0);
    if (createdAt < start && period !== 'all_time') {
      return;
    }

    const reporterId = String(data.reporterId);
    const stats = issueCounts.get(reporterId) ?? {
      reported: 0,
      verified: 0,
    };
    stats.reported += 1;
    if (
      (data.status === 'verified' || data.status === 'resolved') &&
      Array.isArray(
        (data.verification as Record<string, unknown> | undefined)?.verifiedBy,
      ) &&
      ((data.verification as Record<string, unknown>).verifiedBy as unknown[])
        .length > 0
    ) {
      stats.verified += 1;
    }
    issueCounts.set(reporterId, stats);
  });

  const batch = db.batch();
  const now = FieldValue.serverTimestamp();

  usersSnapshot.forEach((doc) => {
    const data = doc.data() as Record<string, unknown>;
    const stats = issueCounts.get(doc.id) ?? { reported: 0, verified: 0 };
    const score =
      stats.reported * DEFAULT_REPUTATION.ISSUE_REPORTED +
      stats.verified * DEFAULT_REPUTATION.ISSUE_VERIFIED +
      Number(data.reputation ?? 0);

    const record = {
      userId: doc.id,
      displayName: (data.displayName as string | undefined) ?? 'Anonymous',
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
