import { onDocumentCreated } from 'firebase-functions/v2/firestore';

import { DEFAULT_REPUTATION } from '../config';
import { db } from '../lib/firebase';
import { recordDailyMetrics } from '../services/analyticsService';
import { createNotification } from '../services/notificationService';
import { adjustReputation } from '../services/reputationService';

export const onCommentCreated = onDocumentCreated(
  { document: 'comments/{commentId}', region: 'us-central1' },
  async (event) => {
    const snap = event.data;
    if (!snap) {
      return;
    }

    const comment = snap.data() as {
      issueId?: string;
      userId?: string;
      text?: string;
    };
    if (!comment.issueId || !comment.userId) {
      return;
    }

    await adjustReputation(comment.userId, DEFAULT_REPUTATION.COMMENT_CREATED);

    await recordDailyMetrics({ comments: 1 });

    const issueSnap = await db.collection('issues').doc(comment.issueId).get();
    if (!issueSnap.exists) {
      return;
    }

    const issue = issueSnap.data() as { reporterId?: string };
    if (issue.reporterId) {
      await createNotification({
        userId: issue.reporterId,
        type: 'comment',
        title: 'New comment on your report',
        body: 'Someone commented on your report.',
        data: { issueId: comment.issueId, commentId: snap.id },
      });
    }
  },
);
