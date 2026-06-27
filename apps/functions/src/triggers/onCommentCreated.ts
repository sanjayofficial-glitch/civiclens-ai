import { onDocumentCreated } from 'firebase-functions/v2/firestore';

import { db } from '../lib/firebase';
import { createNotification } from '../services/notificationService';
import { adjustReputation } from '../services/reputationService';
import { DEFAULT_REPUTATION } from '../config';

export const onCommentCreated = onDocumentCreated('comments/{commentId}', async (event) => {
  const snap = event.data;
  if (!snap) {
    return;
  }

  const comment = snap.data() as { issueId?: string; userId?: string; text?: string };
  if (!comment.issueId || !comment.userId) {
    return;
  }

  await adjustReputation(comment.userId, DEFAULT_REPUTATION.COMMENT_CREATED);

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
});
