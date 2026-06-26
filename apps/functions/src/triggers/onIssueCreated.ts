import { onDocumentCreated, FirestoreEvent } from 'firebase-functions/v2/firestore';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { db } from '../index'; // Assume index exports admin.firestore()

export const onIssueCreated = onDocumentCreated('issues/{issueId}', async (event: FirestoreEvent<QueryDocumentSnapshot | undefined, { issueId: string }>) => {
  const snap = event.data;
  if (!snap || !db) return; // use db to bypass unused warning

  const issueData = snap.data();
    
    // Codex will implement:
    // 1. AI Analysis via Gemini API
    // 2. Duplicate Detection
    // 3. Auto-tagging/categorization
    
    logger.info(`New issue created: ${event.params.issueId}`, issueData);
    
    // Placeholder update to show it was processed
    return snap.ref.update({
      'aiReview.status': 'pending'
    });
  });
