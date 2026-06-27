import { FieldValue } from '../lib/firebase';
import { db } from '../lib/firebase';
import { analyzeIssueMedia } from './geminiService';
import { detectDuplicateIssue } from './duplicateDetectionService';
import { createNotification } from './notificationService';
import { adjustReputation } from './reputationService';
import { DEFAULT_REPUTATION } from '../config';
import type { IssueAnalysisResult } from '../types';

function mapAnalysisToAiSuggestion(analysis: IssueAnalysisResult) {
  return {
    category: analysis.category,
    severity: analysis.severity,
    confidence: analysis.confidence,
    suggestedTitle: analysis.title,
    suggestedDescription: analysis.description,
    suggestedTags: analysis.suggestedTags,
    duplicateProbability: analysis.duplicateScore,
  };
}

export async function enrichIssueOnCreate(issueId: string) {
  const snap = await db.collection('issues').doc(issueId).get();
  if (!snap.exists) {
    return;
  }

  const issue = snap.data() as {
    reporterId: string;
    title: string;
    description: string;
    media?: { images?: string[] };
    location?: { geohash?: string; address?: string };
    category?: string;
  };

  const duplicate = issue.location?.geohash
    ? await detectDuplicateIssue({
        title: issue.title,
        description: issue.description,
        category: String(issue.category ?? 'other'),
        geohash: issue.location.geohash,
      })
    : null;

  const analysis = await analyzeIssueMedia({
    title: issue.title,
    description: issue.description,
    imageUrls: issue.media?.images ?? [],
    locationText: issue.location?.address,
  });

  await snap.ref.set(
    {
      aiAnalysis: mapAnalysisToAiSuggestion(analysis),
      duplicateOf: duplicate?.issueId ?? null,
      duplicateScore: duplicate?.score ?? analysis.duplicateScore,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  await adjustReputation(issue.reporterId, DEFAULT_REPUTATION.ISSUE_REPORTED);

  if (duplicate) {
    await createNotification({
      userId: issue.reporterId,
      type: 'general',
      title: 'Possible duplicate report',
      body: 'We found a similar civic issue report nearby. Please review the suggestion.',
      data: {
        issueId,
        duplicateOf: duplicate.issueId,
        duplicateScore: duplicate.score,
      },
    });
  }
}

export async function updateIssueVerification(issueId: string, verifiedBy: string[], upvotes: number, downvotes: number) {
  const status = upvotes > downvotes ? 'verified' : 'reported';
  await db.collection('issues').doc(issueId).set(
    {
      status,
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
}
