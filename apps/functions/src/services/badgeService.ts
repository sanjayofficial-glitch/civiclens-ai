import { FieldValue, db } from '../lib/firebase';
import { createNotification } from './notificationService';

export const BADGES = [
  { id: 'first-report', name: 'First Report', icon: '🎯', description: 'Submitted your first civic issue' },
  { id: 'verified-10', name: 'Community Voice', icon: '✅', description: 'Verified 10 community reports' },
  { id: 'streak-7', name: '7-Day Streak', icon: '🔥', description: 'Active 7 days in a row' },
  { id: 'photo-pro', name: 'Photo Pro', icon: '📸', description: 'Added photos to 5 reports' },
  { id: 'map-explorer', name: 'Map Explorer', icon: '🗺️', description: 'Explored 20 map locations' },
];

export async function awardBadge(uid: string, badgeId: string) {
  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();
  
  if (!userSnap.exists) return;
  const userData = userSnap.data() as { badges?: string[] };
  
  if (userData.badges?.includes(badgeId)) {
    return; // Already has badge
  }
  
  await userRef.set({
    badges: FieldValue.arrayUnion(badgeId),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  const badgeDef = BADGES.find(b => b.id === badgeId);
  const badgeName = badgeDef?.name ?? 'New Badge';
  const badgeIcon = badgeDef?.icon ?? '🏆';

  await createNotification({
    userId: uid,
    type: 'general',
    title: 'Badge Earned!',
    body: `You just earned the ${badgeIcon} ${badgeName} badge!`,
  });
}

export async function checkReportBadges(uid: string) {
  const issuesSnap = await db.collection('issues').where('reporterId', '==', uid).get();
  
  if (issuesSnap.size >= 1) {
    await awardBadge(uid, 'first-report');
  }

  let photoReports = 0;
  issuesSnap.forEach(doc => {
    const data = doc.data() as { media?: { images?: string[] } };
    if (data.media?.images && data.media.images.length > 0) {
      photoReports++;
    }
  });

  if (photoReports >= 5) {
    await awardBadge(uid, 'photo-pro');
  }
}

export async function checkVerificationBadges(uid: string) {
  const votesSnap = await db.collection('votes').where('userId', '==', uid).get();
  if (votesSnap.size >= 10) {
    await awardBadge(uid, 'verified-10');
  }
}
