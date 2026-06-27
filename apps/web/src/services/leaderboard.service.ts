import { collection, query, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase/firestore.service';
import type { LeaderboardEntry } from '@blockseblock/shared';
import { leaderboardConverter, userConverter } from './converters';

const USERS_COLLECTION = 'users';

export const LeaderboardService = {
  // Querying from users collection since reputation is stored there
  getTopUsers: async (limitCount = 50) => {
    const q = query(
      collection(db, USERS_COLLECTION).withConverter(userConverter),
      orderBy('reputation', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data());
  },

  listenToTopUsers: (limitCount = 50, callback: (users: any[]) => void) => {
    const q = query(
      collection(db, USERS_COLLECTION).withConverter(userConverter),
      orderBy('reputation', 'desc'),
      limit(limitCount)
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(doc => doc.data()));
    });
  }
};
