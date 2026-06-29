import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

import {
  recordAnalyticsEvent,
  recordStatusMetrics,
} from '../services/analyticsService';
import { createNotification } from '../services/notificationService';

export const onIssueUpdated = onDocumentUpdated(
  { document: 'issues/{issueId}', region: 'us-central1' },
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

      // Update global active and resolved counts
      const globalUpdates: Record<string, number> = {};

      if (after.status === 'resolved') {
        globalUpdates.resolvedThisWeek = 1;
      }
      if (before.status === 'resolved') {
        globalUpdates.resolvedThisWeek = -1;
      }

      const wasActive =
        before.status === 'reported' ||
        before.status === 'verified' ||
        before.status === 'in_progress';
      const isActive =
        after.status === 'reported' ||
        after.status === 'verified' ||
        after.status === 'in_progress';

      if (wasActive && !isActive) {
        globalUpdates.activeIssues = -1;
      } else if (!wasActive && isActive) {
        globalUpdates.activeIssues = 1;
      }

      if (Object.keys(globalUpdates).length > 0) {
        await recordAnalyticsEvent('global', 'global', globalUpdates);
      }
    }

    if (after.status === 'resolved') {
      await recordAnalyticsEvent('weekly', 'issue_resolution', {
        resolvedIssues: 1,
      });
    }
  },
);
