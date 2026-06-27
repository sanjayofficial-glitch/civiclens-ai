import { onDocumentCreated } from 'firebase-functions/v2/firestore';

import { db, FieldValue } from '../lib/firebase';
import { adjustReputation } from '../services/reputationService';
import { DEFAULT_REPUTATION } from '../config';
import { createNotification } from '../services/notificationService';

export const onVoteCreated = onDocumentCreated('votes/{voteId}', async (event) => {
  const snap = event.data;
  if (!snap) {
    return;
  }

  const vote = snap.data() as { issueId?: string; userId?: string; type?: 'upvote' | 'downvote' };
  if (!vote.issueId || !vote.userId || !vote.type) {
    return;
  }

  const issueRef = db.collection('issues').doc(vote.issueId);
  await db.runTransaction(async (transaction) => {
    const issueSnap = await transaction.get(issueRef);
    if (!issueSnap.exists) {
      return;
    }

    const issue = issueSnap.data() as {
      verification?: { upvotes?: number; downvotes?: number; verifiedBy?: string[] };
    };

    const upvotes = Number(issue.verification?.upvotes ?? 0) + (vote.type === 'upvote' ? 1 : 0);
    const downvotes = Number(issue.verification?.downvotes ?? 0) + (vote.type === 'downvote' ? 1 : 0);
    const verifiedBy = Array.from(new Set([...(issue.verification?.verifiedBy ?? []), vote.userId]));

    transaction.set(
      issueRef,
      {
        verification: {
          upvotes,
          downvotes,
          verifiedBy,
          verifiedAt: FieldValue.serverTimestamp(),
        },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });

  await adjustReputation(
    vote.userId,
    vote.type === 'upvote'
      ? DEFAULT_REPUTATION.UPVOTE_CAST
      : DEFAULT_REPUTATION.DOWNVOTE_CAST,
  );

  await createNotification({
    userId: vote.userId,
    type: 'verification',
    title: 'Vote saved',
    body: `Your ${vote.type} has been recorded successfully.`,
    data: { issueId: vote.issueId, voteType: vote.type },
  });
});
