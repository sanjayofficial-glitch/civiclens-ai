import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase/firestore.service';
import type { User } from '@blockseblock/shared';
import { userConverter } from './converters';

const USERS_COLLECTION = 'users';

export const UserService = {
  createProfile: async (uid: string, data: Partial<User>) => {
    const cleanData = { ...data };
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key as keyof typeof cleanData] === undefined) {
        delete cleanData[key as keyof typeof cleanData];
      }
    });
    return setDoc(doc(db, USERS_COLLECTION, uid), cleanData, { merge: true });
  },

  getProfile: async (uid: string) => {
    const snap = await getDoc(doc(db, USERS_COLLECTION, uid).withConverter(userConverter));
    return snap.exists() ? snap.data() : null;
  },

  updateProfile: async (uid: string, data: Partial<User>) => {
    const cleanData = { ...data };
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key as keyof typeof cleanData] === undefined) {
        delete cleanData[key as keyof typeof cleanData];
      }
    });
    return updateDoc(doc(db, USERS_COLLECTION, uid), cleanData);
  },

  ensureProfile: async (
    uid: string,
    data: Partial<User> & { locationLabel?: string },
  ) => {
    const ref = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      const payload: any = {
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
        fcmTokens: data.fcmTokens ?? [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (data.location !== undefined) payload.location = data.location;
      if (data.locationLabel !== undefined) payload.locationLabel = data.locationLabel;
      return setDoc(ref, payload, { merge: true });
    }

    const updatePayload: any = {
      ...data,
      updatedAt: serverTimestamp(),
    };
    Object.keys(updatePayload).forEach(key => {
      if (updatePayload[key] === undefined) {
        delete updatePayload[key];
      }
    });

    return updateDoc(ref, updatePayload);
  },
};
