/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import * as functions from 'firebase-functions';

import {
  recordAnalyticsEvent,
  recordStatusMetrics,
} from '../services/analyticsService';
import { createNotification } from '../services/notificationService';

export const onIssueUpdated = functions.firestore
  .document('issues/{issueId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status !== after.status) {
      const reporterId = String(after.reporterId ?? '');
      if (reporterId) {
        await createNotification({
          userId: reporterId,
          type: 'issue_update',
          title: 'Issue status changed',
          body: `Your report is now ${String(after.status)}.`,
          data: {
            issueId: context.params.issueId,
            status: String(after.status),
          },
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
  });
