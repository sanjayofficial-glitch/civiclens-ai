import * as functions from 'firebase-functions/v1';

import { REGION } from '../config';
import { log } from '../lib/logger';
import {
  recordDailyMetrics,
  recordCategoryMetrics,
  recordStatusMetrics,
  recordAnalyticsEvent,
} from '../services/analyticsService';
import { enrichIssueOnCreate } from '../services/issueService';

export const onIssueCreated = functions
  .region(REGION)
  .firestore.document('issues/{issueId}')
  .onCreate(async (snap, context) => {
    const issueId = context.params.issueId;

    log.info('Issue created trigger fired', { issueId });
    await enrichIssueOnCreate(issueId);

    const issue = snap.data() as { category?: string };
    await Promise.all([
      recordDailyMetrics({ newIssues: 1 }),
      recordCategoryMetrics(issue.category ?? 'other'),
      recordStatusMetrics('reported'),
      recordAnalyticsEvent('global', 'global', {
        totalReports: 1,
        activeIssues: 1,
      }),
    ]);
  });
