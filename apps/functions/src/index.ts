import * as admin from 'firebase-admin';

admin.initializeApp();

export const db = admin.firestore();

// Export triggers
export * from './triggers/onIssueCreated';

// Export callables
export * from './callables/updateLeaderboard';
