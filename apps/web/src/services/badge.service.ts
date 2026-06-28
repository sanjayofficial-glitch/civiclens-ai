import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase/firestore.service';
import type { User } from '@civiclens/shared';

const USERS_COLLECTION = 'users';

const BADGE_THRESHOLDS = {
  reports: [
    { id: 'report-1', count: 1 },
    { id: 'report-5', count: 5 },
    { id: 'report-10', count: 10 },
    { id: 'report-25', count: 25 },
    { id: 'report-50', count: 50 },
  ],
  verifications: [
    { id: 'verify-10', count: 10 },
    { id: 'verify-25', count: 25 },
    { id: 'verify-50', count: 50 },
  ],
  streaks: [
    { id: 'streak-7', count: 7 },
    { id: 'streak-30', count: 30 },
    { id: 'streak-90', count: 90 },
  ]
};

export const BadgeService = {
  awardBadge: async (userId: string, badgeId: string) => {
    const userRef = doc(db, USERS_COLLECTION, userId);
    return updateDoc(userRef, {
      badges: arrayUnion(badgeId)
    });
  },

  evaluateAndAwardBadges: async (uid: string, userData: User) => {
    const currentBadges = new Set<string>(userData.badges || []);
    const newBadges: string[] = [];

    const reported = userData.issuesReported || 0;
    const verified = userData.issuesVerified || 0;
    const streak = userData.streakDays || 0;

    for (const threshold of BADGE_THRESHOLDS.reports) {
      if (reported >= threshold.count && !currentBadges.has(threshold.id)) {
        newBadges.push(threshold.id);
      }
    }
    for (const threshold of BADGE_THRESHOLDS.verifications) {
      if (verified >= threshold.count && !currentBadges.has(threshold.id)) {
        newBadges.push(threshold.id);
      }
    }
    for (const threshold of BADGE_THRESHOLDS.streaks) {
      if (streak >= threshold.count && !currentBadges.has(threshold.id)) {
        newBadges.push(threshold.id);
      }
    }

    if (newBadges.length > 0) {
      try {
        await updateDoc(doc(db, USERS_COLLECTION, uid), {
          badges: arrayUnion(...newBadges),
        });
      } catch (err) {
        console.error('Failed to award badges on client:', err);
      }
    }
  }
};
