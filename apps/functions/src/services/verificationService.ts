import { FieldValue, db } from '../lib/firebase';

export async function registerVote(input: {
  issueId: string;
  userId: string;
  type: 'upvote' | 'downvote';
}) {
  const voteId = `${input.issueId}_${input.userId}`;
  const issueRef = db.collection('issues').doc(input.issueId);
  const voteRef = db.collection('votes').doc(voteId);

  await db.runTransaction(async (transaction) => {
    const issueSnap = await transaction.get(issueRef);
    if (!issueSnap.exists) {
      throw new Error('Issue not found.');
    }

    const existingVoteSnap = await transaction.get(voteRef);
    if (existingVoteSnap.exists) {
      throw new Error('Duplicate vote.');
    }

    transaction.set(voteRef, {
      issueId: input.issueId,
      userId: input.userId,
      type: input.type,
      createdAt: FieldValue.serverTimestamp(),
    });

    const issue = issueSnap.data() as {
      verification?: {
        upvotes?: number;
        downvotes?: number;
        verifiedBy?: string[];
      };
    };

    const upvotes =
      (issue.verification?.upvotes ?? 0) + (input.type === 'upvote' ? 1 : 0);
    const downvotes =
      (issue.verification?.downvotes ?? 0) +
      (input.type === 'downvote' ? 1 : 0);
    const verifiedBy = Array.from(
      new Set([...(issue.verification?.verifiedBy ?? []), input.userId]),
    );

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
}
