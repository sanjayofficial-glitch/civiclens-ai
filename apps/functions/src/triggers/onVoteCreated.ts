import * as functions from 'firebase-functions';

import { DEFAULT_REPUTATION } from '../config';
import { db } from '../lib/firebase';
import {
  recordDailyMetrics,
  recordAnalyticsEvent,
} from '../services/analyticsService';
import {
  checkAndAwardBadges,
  updateActivityStreak,
} from '../services/badgeService';
import { createNotification } from '../services/notificationService';
import { adjustReputation } from '../services/reputationService';

export const onVoteCreated = functions.firestore
  .document('votes/{voteId}')
  .onCreate(async (snap) => {
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
      await recordAnalyticsEvent('global', 'global', {
        communityVerifications: 1,
      });
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
  });
