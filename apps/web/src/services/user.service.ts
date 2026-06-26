import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase/firestore';
import { User } from '@blockseblock/shared/types';

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
  }
};
