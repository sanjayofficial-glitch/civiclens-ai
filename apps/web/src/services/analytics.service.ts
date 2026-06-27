import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase/firestore.service';

const ANALYTICS_COLLECTION = 'analytics';
const GLOBAL_DOC = 'global';

export interface GlobalStats {
  totalReports: number;
  resolvedThisWeek: number;
  activeIssues: number;
  communityVerifications: number;
}

export const AnalyticsService = {
  getCommunityStats: async (): Promise<GlobalStats | null> => {
    const docRef = doc(db, ANALYTICS_COLLECTION, GLOBAL_DOC);
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as GlobalStats) : null;
  },

  listenToCommunityStats: (callback: (stats: GlobalStats | null) => void) => {
    return onSnapshot(doc(db, ANALYTICS_COLLECTION, GLOBAL_DOC), (snap) => {
      callback(snap.exists() ? (snap.data() as GlobalStats) : null);
    });
  }
};
