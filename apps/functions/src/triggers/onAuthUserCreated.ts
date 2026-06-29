import type { UserRecord } from 'firebase-admin/auth';

import * as functions from 'firebase-functions';

import { FieldValue, db, auth } from '../lib/firebase';
import { log } from '../lib/logger';
import { LeaderboardRepository } from '../repositories/leaderboardRepository';
import { normalizeRole } from '../services/authService';

export const onAuthUserCreated = functions.auth
  .user()
  .onCreate(async (user: UserRecord) => {
    const role = normalizeRole(user.customClaims?.role);

    await db
      .collection('users')
      .doc(user.uid)
      .set(
        {
          uid: user.uid,
          displayName: user.displayName ?? 'Anonymous Citizen',
          email: user.email ?? '',
          photoURL: user.photoURL ?? null,
          phoneNumber: user.phoneNumber ?? null,
          role,
          reputation: 0,
          badges: [],
          streakDays: 0,
          lastActive: FieldValue.serverTimestamp(),
          fcmTokens: [],
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

    await auth.setCustomUserClaims(user.uid, { role });

    // Initialize leaderboard entries
    const leaderboard = new LeaderboardRepository();
    const periods = ['weekly', 'monthly', 'all_time'] as const;
    const batch = db.batch();

    for (const period of periods) {
      batch.set(
        leaderboard.doc(`${period}_${user.uid}`),
        {
          userId: user.uid,
          displayName: user.displayName ?? 'Anonymous Citizen',
          photoURL: user.photoURL ?? null,
          score: 0,
          issuesReported: 0,
          issuesVerified: 0,
          period,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }
    await batch.commit();

    log.info('Auth user profile initialized', { uid: user.uid, role });
  });
