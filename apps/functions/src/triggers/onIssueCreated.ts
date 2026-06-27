import { onDocumentCreated, FirestoreEvent } from 'firebase-functions/v2/firestore';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

import { enrichIssueOnCreate } from '../services/issueService';
import { log } from '../lib/logger';
import { recordDailyMetrics, recordCategoryMetrics, recordStatusMetrics } from '../services/analyticsService';

export const onIssueCreated = onDocumentCreated(
  'issues/{issueId}',
  async (
    event: FirestoreEvent<QueryDocumentSnapshot | undefined, { issueId: string }>,
  ) => {
    const issueId = event.params.issueId;
    const snap = event.data;
    if (!snap) {
      return;
    }

    log.info('Issue created trigger fired', { issueId });
    await enrichIssueOnCreate(issueId);

    const issue = snap.data() as { category?: string };
    await Promise.all([
      recordDailyMetrics({ newIssues: 1 }),
      recordCategoryMetrics(issue.category ?? 'other'),
      recordStatusMetrics('reported'),
    ]);
  },
);

