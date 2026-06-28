import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

import {
  recordAnalyticsEvent,
  recordStatusMetrics,
} from '../services/analyticsService';
import { createNotification } from '../services/notificationService';

export const onIssueUpdated = onDocumentUpdated(
  'issues/{issueId}',
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) {
      return;
    }

    if (before.status !== after.status) {
      const reporterId = String(after.reporterId ?? '');
      if (reporterId) {
        await createNotification({
          userId: reporterId,
          type: 'issue_update',
          title: 'Issue status changed',
          body: `Your report is now ${String(after.status)}.`,
          data: { issueId: event.params.issueId, status: String(after.status) },
        });
      }

      await recordStatusMetrics(String(after.status));
    }

    if (after.status === 'resolved') {
      await recordAnalyticsEvent('weekly', 'issue_resolution', {
        resolvedIssues: 1,
      });
    }
  },
);
