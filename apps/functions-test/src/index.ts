import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';

admin.initializeApp();

export const ping = onCall(
  { region: 'asia-south1' },
  () => {
    return { status: 'ok', timestamp: Date.now() };
  }
);