import { onCall } from 'firebase-functions/v2/https';
import { z } from 'zod';

import { REGION } from '../config';
import { assertAuth } from '../lib/errors';
import { FieldValue, db } from '../lib/firebase';
import { parseInput } from '../lib/validation';

const schema = z.object({
  issueId: z.string().min(1),
  text: z.string().min(1).max(2000),
});

export const addComment = onCall({ region: REGION }, async (request) => {
  assertAuth(request.auth);
  const input = parseInput<{ issueId: string; text: string }>(
    schema,
    request.data ?? {},
  );

  const userSnap = await db.collection('users').doc(request.auth.uid).get();
  const userData = userSnap.data();

  const commentRef = await db.collection('comments').add({
    issueId: input.issueId,
    userId: request.auth.uid,
    text: input.text,
    userName:
      typeof userData?.displayName === 'string'
        ? userData.displayName
        : 'Citizen',
    userPhoto:
      typeof userData?.photoURL === 'string' ? userData.photoURL : null,
    createdAt: FieldValue.serverTimestamp(),
  });

  return {
    status: 'success',
    commentId: commentRef.id,
  };
});
