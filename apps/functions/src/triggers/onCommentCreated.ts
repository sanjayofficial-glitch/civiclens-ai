import { onDocumentCreated } from 'firebase-functions/v2/firestore';

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
  await createNotification({
    userId: comment.userId,
    type: 'comment',
    title: 'Comment received',
    body: 'Your comment was recorded on the report.',
    data: { issueId: comment.issueId, commentId: snap.id },
  });
});
