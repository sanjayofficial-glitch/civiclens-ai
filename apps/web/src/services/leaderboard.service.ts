import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase/firestore.service';
import { leaderboardConverter } from './converters';

const LEADERS_COLLECTION = 'leaderboard';

export const LeaderboardService = {
  listenToLeaderboard: (period: string, limitCount = 50, callback: (entries: any[]) => void) => {
    const q = query(
      collection(db, LEADERS_COLLECTION).withConverter(leaderboardConverter),
      where('period', '==', period),
      orderBy('score', 'desc'),
      limit(limitCount)
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(doc => {
        const data = doc.data();
        return {
          uid: data.userId,
          displayName: data.displayName,
          photoURL: data.photoURL,
          reputation: data.score,
          issuesReported: data.issuesReported,
          issuesVerified: data.issuesVerified,
          period: data.period,
        };
      }));
    });
  }
};
