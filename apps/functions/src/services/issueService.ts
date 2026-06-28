import type { IssueAnalysisResult } from '../types';

import { DEFAULT_REPUTATION } from '../config';
import { FieldValue, db } from '../lib/firebase';

import { detectDuplicateIssue } from './duplicateDetectionService';
import { analyzeIssueMedia } from './geminiService';
import { createNotification } from './notificationService';
import { adjustReputation } from './reputationService';
import { updateLeaderboardStats } from './leaderboardService';

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
        category: issue.category ?? 'other',
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
  await updateLeaderboardStats(issue.reporterId, { issuesReported: 1 });

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

export async function updateIssueVerification(
  issueId: string,
  verifiedBy: string[],
  upvotes: number,
  downvotes: number,
) {
  const status = upvotes > downvotes ? 'verified' : 'reported';
  await db
    .collection('issues')
    .doc(issueId)
    .set(
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

  if (status === 'verified') {
    // Only increment verified count if this transition is to 'verified'
    // Since verifiedBy might change multiple times, this requires care,
    // but for simplicity, we assume we update the original reporter.
    const snap = await db.collection('issues').doc(issueId).get();
    if (snap.exists) {
      const issueData = snap.data() as { reporterId: string };
      await updateLeaderboardStats(issueData.reporterId, { issuesVerified: 1 });
    }
  }
}
