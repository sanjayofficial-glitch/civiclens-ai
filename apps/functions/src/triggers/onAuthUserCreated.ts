import * as functions from 'firebase-functions';

import { FieldValue, db, auth } from '../lib/firebase';
import { log } from '../lib/logger';
import { normalizeRole } from '../services/authService';

export const onAuthUserCreated = functions.auth
  .user()
  .onCreate(async (user) => {
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
    log.info('Auth user profile initialized', { uid: user.uid, role });
  });
