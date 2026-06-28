import { onDocumentCreated } from 'firebase-functions/v2/firestore';

import { DEFAULT_REPUTATION } from '../config';
import { db } from '../lib/firebase';
import { recordDailyMetrics } from '../services/analyticsService';
import { createNotification } from '../services/notificationService';
import { adjustReputation } from '../services/reputationService';
import { checkAndAwardBadges, updateActivityStreak } from '../services/badgeService';

export const onVoteCreated = onDocumentCreated(
  'votes/{voteId}',
  async (event) => {
    const snap = event.data;
    if (!snap) {
      return;
    }

    const vote = snap.data() as {
      issueId?: string;
      userId?: string;
      type?: 'upvote' | 'downvote';
    };
    if (!vote.issueId || !vote.userId || !vote.type) {
      return;
    }

    await adjustReputation(
      vote.userId,
      vote.type === 'upvote'
        ? DEFAULT_REPUTATION.UPVOTE_CAST
        : DEFAULT_REPUTATION.DOWNVOTE_CAST,
    );
    await updateActivityStreak(vote.userId);
    await checkAndAwardBadges(vote.userId);

    if (vote.type === 'upvote') {
      await recordDailyMetrics({ verifications: 1 });
    }

    const issueSnap = await db.collection('issues').doc(vote.issueId).get();
    if (!issueSnap.exists) {
      return;
    }

    const issue = issueSnap.data() as { reporterId?: string };
    if (issue.reporterId) {
      await createNotification({
        userId: issue.reporterId,
        type: 'verification',
        title: 'New vote on your report',
        body: `Your issue received a ${vote.type} vote.`,
        data: { issueId: vote.issueId, voteType: vote.type },
      });
    }
  },
);
