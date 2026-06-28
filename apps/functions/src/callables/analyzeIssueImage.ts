import type { IssueAnalysisResult } from '../types';

import { onCall } from 'firebase-functions/v2/https';
import { z } from 'zod';

import { assertAuth, fail } from '../lib/errors';
import { db, FieldValue } from '../lib/firebase';
import { parseInput } from '../lib/validation';
import { analyzeIssueMedia } from '../services/geminiService';

/**
 * Callable that accepts either:
 *   - `issueId`: reads the issue doc from Firestore and analyzes its images
 *   - `imageUrl` + optional `title`/`description`/`locationText`: analyzes a single image directly
 *
 * The direct mode is used by the ReportWizard for preview analysis before submission.
 * The issueId mode is used for post-submission re-analysis.
 */
const issueIdSchema = z.object({
  issueId: z.string().min(1),
});

const directSchema = z.object({
  imageUrl: z.string().url(),
  title: z.string().optional().default(''),
  description: z.string().optional().default(''),
  locationText: z.string().optional().default(''),
});

  return {
    category: analysis.category,
    severity: analysis.severity,
    confidence: analysis.confidence,
    suggestedTitle: analysis.suggestedTitle,
    suggestedDescription: analysis.suggestedDescription,
    suggestedTags: analysis.suggestedTags,
    duplicateProbability: analysis.duplicateScore,
    usedFallback: analysis.usedFallback,
  };
}

export const analyzeIssueImage = onCall(async (request) => {
  assertAuth(request.auth);

  // Try directSchema first (wizard mode), fall back to issueIdSchema
  const directResult = directSchema.safeParse(request.data ?? {});
  if (directResult.success) {
    const { imageUrl, title, description, locationText } = directResult.data;
    const analysis = await analyzeIssueMedia({
      title,
      description,
      imageUrls: [imageUrl],
      locationText: locationText || undefined,
    });

    return { status: analysis.usedFallback ? 'fallback' : 'success', analysis: toAiSuggestion(analysis) };
  }

  // Try issueIdSchema
  const parsed = parseInput<{ issueId: string }>(
    issueIdSchema,
    request.data ?? {},
  );
  const snap = await db.collection('issues').doc(parsed.issueId).get();
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
    title: issue.title ?? '',
    description: issue.description ?? '',
    imageUrls: issue.media?.images ?? [],
    locationText: issue.location?.address,
  });

  const aiSuggestion = toAiSuggestion(analysis);

  // Persist analysis back to the issue doc
  await snap.ref.set(
    {
      aiAnalysis: aiSuggestion,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return { status: analysis.usedFallback ? 'fallback' : 'success', analysis: aiSuggestion };
});
