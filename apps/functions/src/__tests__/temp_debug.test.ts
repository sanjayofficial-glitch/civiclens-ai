/* eslint-disable no-console, @typescript-eslint/restrict-template-expressions */

import * as admin from 'firebase-admin';
import { describe, it } from 'vitest';

describe('Debug Database', () => {
  it('prints all issues', async () => {
    // Set up env and initialize before importing the firebase module
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

    if (admin.apps.length === 0) {
      admin.initializeApp({
        projectId: 'blockseblock-dev',
        storageBucket: 'blockseblock-dev.appspot.com',
      });
    }

    const { db } = await import('../lib/firebase');

    console.log('=== START DATABASE DUMP ===');
    const snapshot = await db.collection('issues').get();
    console.log(`Total Issues Found: ${snapshot.size}`);
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\nIssue ID: ${doc.id}`);
      console.log(`Title: ${data.title}`);
      console.log(`Status: ${data.status}`);
      console.log(`Media: ${JSON.stringify(data.media)}`);
      console.log(`aiAnalysis: ${JSON.stringify(data.aiAnalysis)}`);
    });
    console.log('=== END DATABASE DUMP ===');
  });
});
