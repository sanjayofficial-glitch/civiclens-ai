import { onCall } from 'firebase-functions/v2/https';
import { z } from 'zod';

import { assertAuth, fail } from '../lib/errors';
import { parseInput } from '../lib/validation';
import { analyzeIssueMedia } from '../services/geminiService';
import { db, FieldValue } from '../lib/firebase';

const schema = z.object({
  issueId: z.string().min(1),
});

export const analyzeIssueImage = onCall(async (request) => {
  assertAuth(request.auth);
  const input = parseInput<{ issueId: string }>(schema, request.data ?? {});

  const snap = await db.collection('issues').doc(input.issueId).get();
  if (!snap.exists) {
    fail('not-found', 'Issue not found.');
  }

  const issue = snap.data() as {
    title?: string;
    description?: string;
    media?: { images?: string[] };
    location?: { address?: string };
  };

  const analysis = await analyzeIssueMedia({
    title: String(issue.title ?? ''),
    description: String(issue.description ?? ''),
    imageUrls: issue.media?.images ?? [],
    locationText: issue.location?.address,
  });

  await snap.ref.set(
    {
      aiAnalysis: analysis,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return {
    status: 'success',
    analysis,
  };
});
