import * as functions from 'firebase-functions';
import { db } from '../index';

import { CallableRequest } from 'firebase-functions/v2/https';

export const updateLeaderboard = functions.https.onCall(async (request: CallableRequest) => {
  const { data, auth } = request;
  if (!auth || !db || !data) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in.');
  }

  // Codex will implement:
  // 1. Calculate points for user
  // 2. Update leaderboard collection
  // 3. Grant badges if thresholds met
  
  return { status: 'success', message: 'Leaderboard updated' };
});
