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

export async function updateLeaderboardStats(
  uid: string,
  deltas: { score?: number; issuesReported?: number; issuesVerified?: number },
) {
  const batch = db.batch();
  const periods = ['weekly', 'monthly', 'all_time'] as const;
  const now = FieldValue.serverTimestamp();

  const userSnap = await db.collection('users').doc(uid).get();
  const userData = userSnap.data() as
    | { displayName?: string; photoURL?: string | null }
    | undefined;
  const displayName = userData?.displayName ?? 'Anonymous Citizen';
  const photoURL = userData?.photoURL ?? null;

  for (const period of periods) {
    const docRef = leaderboard.doc(`${period}_${uid}`);
    const updates: Record<string, unknown> = {
      updatedAt: now,
      period,
      userId: uid,
      displayName,
      photoURL,
    };
    if (deltas.score !== undefined) {
      updates.score = FieldValue.increment(deltas.score);
    }
    if (deltas.issuesReported !== undefined) {
      updates.issuesReported = FieldValue.increment(deltas.issuesReported);
    }
    if (deltas.issuesVerified !== undefined) {
      updates.issuesVerified = FieldValue.increment(deltas.issuesVerified);
    }
    batch.set(docRef, updates, { merge: true });
  }

  await batch.commit();
}

export async function rebuildLeaderboard(
  period: 'weekly' | 'monthly' | 'all_time',
) {
  const start = periodWindow(period);
  const usersSnapshot = await db.collection('users').get();
  const issuesSnapshot = await db.collection('issues').get();

  // Track period points and stats per user
  const userStats = new Map<
    string,
    { score: number; reported: number; verified: number }
  >();

  const ensureUser = (uid: string) => {
    if (!userStats.has(uid)) {
      userStats.set(uid, { score: 0, reported: 0, verified: 0 });
    }
    return userStats.get(uid) as {
      score: number;
      reported: number;
      verified: number;
    };
  };

  issuesSnapshot.forEach((doc) => {
    const data = doc.data() as Record<string, unknown>;
    const createdAt =
      (data.createdAt as { toDate?: () => Date } | undefined)?.toDate?.() ??
      new Date(0);

    if (createdAt >= start || period === 'all_time') {
      const reporterId = String(data.reporterId);
      const stats = ensureUser(reporterId);
      stats.reported += 1;
      stats.score += DEFAULT_REPUTATION.ISSUE_REPORTED;

      if (data.status === 'resolved') {
        stats.score += DEFAULT_REPUTATION.ISSUE_RESOLVED;
      }
    }

    // Verifications (assuming verification timestamp is close to issue creation for now, or just counting all verifications on issues created in this period - a simplification)
    // Actually, to be perfectly accurate we'd need a separate verifications collection, but let's use the issue's verifiedBy array.
    if (
      (data.status === 'verified' || data.status === 'resolved') &&
      Array.isArray(
        (data.verification as Record<string, unknown> | undefined)?.verifiedBy,
      )
    ) {
      const verifiedBy = (data.verification as Record<string, unknown>)
        .verifiedBy as string[];
      for (const verifierId of verifiedBy) {
        // If period is not all_time, we only count verifications on issues *created* in this period as a proxy,
        // since we don't have verification timestamps.
        if (createdAt >= start || period === 'all_time') {
          const vStats = ensureUser(verifierId);
          vStats.verified += 1;
          vStats.score += DEFAULT_REPUTATION.ISSUE_VERIFIED;
        }
      }
    }
  });

  if (period !== 'all_time') {
    // Add votes in period
    const votesQuery = await db
      .collection('votes')
      .where('createdAt', '>=', start)
      .get();
    votesQuery.forEach((doc) => {
      const data = doc.data() as {
        userId: string;
        type: 'upvote' | 'downvote';
      };
      const stats = ensureUser(data.userId);
      stats.score +=
        data.type === 'upvote'
          ? DEFAULT_REPUTATION.UPVOTE_CAST
          : DEFAULT_REPUTATION.DOWNVOTE_CAST;
    });

    // Add comments in period
    const commentsQuery = await db
      .collection('comments')
      .where('createdAt', '>=', start)
      .get();
    commentsQuery.forEach((doc) => {
      const data = doc.data() as { authorId: string };
      const stats = ensureUser(data.authorId);
      stats.score += DEFAULT_REPUTATION.COMMENT_CREATED;
    });
  }

  // Get current leaderboard to determine previous ranks
  const currentLeaderboard = await db
    .collection('leaderboard')
    .where('period', '==', period)
    .get();
  const previousRanks = new Map<string, number>();
  currentLeaderboard.forEach((doc) => {
    const data = doc.data() as { userId: string; currentRank?: number };
    if (typeof data.currentRank === 'number') {
      previousRanks.set(data.userId, data.currentRank);
    }
  });

  const batch = db.batch();
  const now = FieldValue.serverTimestamp();

  // Prepare records to sort for current rank
  const newRecords: {
    userId: string;
    displayName: string;
    photoURL: string | null;
    score: number;
    issuesReported: number;
    issuesVerified: number;
    period: string;
    updatedAt: unknown;
    previousRank: number | null;
    currentRank?: number;
  }[] = [];

  usersSnapshot.forEach((doc) => {
    const data = doc.data() as Record<string, unknown>;
    const uid = doc.id;
    let score = 0;
    let reported = 0;
    let verified = 0;

    if (period === 'all_time') {
      score = Number(data.reputation ?? 0);
      reported = Number(data.issuesReported ?? 0);
      verified = Number(data.issuesVerified ?? 0);
    } else {
      const stats = userStats.get(uid);
      if (stats) {
        score = stats.score;
        reported = stats.reported;
        verified = stats.verified;
      }
    }

    newRecords.push({
      userId: uid,
      displayName: (data.displayName as string | undefined) ?? 'Anonymous',
      photoURL: (data.photoURL as string | undefined) ?? null,
      score,
      issuesReported: reported,
      issuesVerified: verified,
      period,
      updatedAt: now,
      previousRank: previousRanks.get(uid) ?? null,
    });
  });

  // Sort by score desc to assign current rank
  newRecords.sort((a, b) => b.score - a.score);

  let currentRank = 1;
  for (let i = 0; i < newRecords.length; i++) {
    // Handle ties
    if (i > 0 && newRecords[i].score < newRecords[i - 1].score) {
      currentRank = i + 1;
    }
    newRecords[i].currentRank = currentRank;

    const record = newRecords[i];
    batch.set(leaderboard.doc(`${period}_${record.userId}`), record, {
      merge: true,
    });
  }

  await batch.commit();
}
