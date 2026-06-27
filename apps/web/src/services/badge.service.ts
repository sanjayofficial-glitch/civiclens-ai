import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase/firestore.service';

const USERS_COLLECTION = 'users';

export const BadgeService = {
  awardBadge: async (userId: string, badgeId: string) => {
    const userRef = doc(db, USERS_COLLECTION, userId);
    return updateDoc(userRef, {
      badges: arrayUnion(badgeId)
    });
  }
};
