import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase/firestore';
import type { User } from '@blockseblock/shared';

const USERS_COLLECTION = 'users';

export const UserService = {
  createProfile: async (uid: string, data: Partial<User>) => {
    return setDoc(doc(db, USERS_COLLECTION, uid), data, { merge: true });
  },

  getProfile: async (uid: string) => {
    const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
    return snap.exists() ? { uid: snap.id, ...snap.data() } as User : null;
  },

  updateProfile: async (uid: string, data: Partial<User>) => {
    return updateDoc(doc(db, USERS_COLLECTION, uid), data);
  },

  ensureProfile: async (
    uid: string,
    data: Partial<User> & { locationLabel?: string },
  ) => {
    const ref = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return setDoc(
        ref,
        {
          uid,
          displayName: data.displayName ?? 'Anonymous Citizen',
          email: data.email ?? '',
          photoURL: data.photoURL ?? null,
          phoneNumber: data.phoneNumber ?? null,
          role: data.role ?? 'citizen',
          reputation: data.reputation ?? 0,
          badges: data.badges ?? [],
          streakDays: data.streakDays ?? 0,
          lastActive: serverTimestamp(),
          location: data.location,
          locationLabel: (data as Partial<User> & { locationLabel?: string }).locationLabel,
          fcmTokens: data.fcmTokens ?? [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    }

    return updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },
};
