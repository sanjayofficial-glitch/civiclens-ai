import { FieldValue, db } from '../lib/firebase';
import { createNotification } from './notificationService';

export const BADGES = [
  { id: 'report-1', name: 'First Report', icon: '🎯', description: 'Submitted your first civic issue' },
  { id: 'report-5', name: 'Five Reports', icon: '🌟', description: 'Submitted 5 reports' },
  { id: 'report-10', name: 'Ten Reports', icon: '⭐', description: 'Submitted 10 reports' },
  { id: 'report-25', name: 'Quarter Century', icon: '🏅', description: 'Submitted 25 reports' },
  { id: 'report-50', name: 'Half Century', icon: '🏆', description: 'Submitted 50 reports' },
  { id: 'verify-10', name: 'Truth Seeker', icon: '✅', description: 'Verified 10 reports' },
  { id: 'verify-25', name: 'Fact Checker', icon: '🔍', description: 'Verified 25 reports' },
  { id: 'verify-50', name: 'Master Verifier', icon: '👑', description: 'Verified 50 reports' },
  { id: 'streak-7', name: '7-Day Streak', icon: '🔥', description: 'Active 7 days in a row' },
  { id: 'streak-30', name: '30-Day Streak', icon: '☄️', description: 'Active 30 days in a row' },
  { id: 'streak-90', name: '90-Day Streak', icon: '🌋', description: 'Active 90 days in a row' },
  { id: 'photo-pro', name: 'Photo Pro', icon: '📸', description: 'Added photos to 5 reports' },
  { id: 'detail-oriented', name: 'Detail Oriented', icon: '📝', description: 'Wrote detailed descriptions for 5 reports' },
  { id: 'pothole-hunter', name: 'Pothole Hunter', icon: '🕳️', description: 'Reported 5 potholes' },
  { id: 'streetlight-guardian', name: 'Streetlight Guardian', icon: '💡', description: 'Reported 5 streetlights' },
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

export async function checkAndAwardBadges(uid: string) {
  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();
  if (!userSnap.exists) return;

  const userData = userSnap.data() as any;
  const currentBadges = new Set<string>(userData.badges || []);
  const newBadges: string[] = [];

  const reported = userData.issuesReported || 0;
  const verified = userData.issuesVerified || 0;
  const streak = userData.streakDays || 0;

  // Report Milestones
  if (reported >= 1 && !currentBadges.has('report-1')) newBadges.push('report-1');
  if (reported >= 5 && !currentBadges.has('report-5')) newBadges.push('report-5');
  if (reported >= 10 && !currentBadges.has('report-10')) newBadges.push('report-10');
  if (reported >= 25 && !currentBadges.has('report-25')) newBadges.push('report-25');
  if (reported >= 50 && !currentBadges.has('report-50')) newBadges.push('report-50');

  // Verification Milestones
  if (verified >= 10 && !currentBadges.has('verify-10')) newBadges.push('verify-10');
  if (verified >= 25 && !currentBadges.has('verify-25')) newBadges.push('verify-25');
  if (verified >= 50 && !currentBadges.has('verify-50')) newBadges.push('verify-50');

  // Streaks
  if (streak >= 7 && !currentBadges.has('streak-7')) newBadges.push('streak-7');
  if (streak >= 30 && !currentBadges.has('streak-30')) newBadges.push('streak-30');
  if (streak >= 90 && !currentBadges.has('streak-90')) newBadges.push('streak-90');

  // Category & Quality
  if (!currentBadges.has('pothole-hunter') || !currentBadges.has('streetlight-guardian') || !currentBadges.has('photo-pro') || !currentBadges.has('detail-oriented')) {
    const issuesSnap = await db.collection('issues').where('reporterId', '==', uid).get();
    let potholes = 0;
    let streetlights = 0;
    let photos = 0;
    let details = 0;

    issuesSnap.forEach(doc => {
      const data = doc.data() as any;
      if (data.category === 'pothole') potholes++;
      if (data.category === 'streetlight') streetlights++;
      if (data.media?.images?.length > 0) photos++;
      if (data.description && data.description.length > 50) details++;
    });

    if (potholes >= 5 && !currentBadges.has('pothole-hunter')) newBadges.push('pothole-hunter');
    if (streetlights >= 5 && !currentBadges.has('streetlight-guardian')) newBadges.push('streetlight-guardian');
    if (photos >= 5 && !currentBadges.has('photo-pro')) newBadges.push('photo-pro');
    if (details >= 5 && !currentBadges.has('detail-oriented')) newBadges.push('detail-oriented');
  }

  for (const badgeId of newBadges) {
    await awardBadge(uid, badgeId);
  }
}

export async function updateActivityStreak(uid: string) {
  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();
  if (!userSnap.exists) return;

  const data = userSnap.data() as any;
  const now = new Date();
  const lastActive = data.lastActive?.toDate() || new Date(0);
  
  // Normalize to midnight UTC
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const last = new Date(Date.UTC(lastActive.getUTCFullYear(), lastActive.getUTCMonth(), lastActive.getUTCDate()));
  
  const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  let newStreak = data.streakDays || 0;
  
  if (diffDays === 1) {
    newStreak += 1;
  } else if (diffDays > 1) {
    newStreak = 1;
  } else if (diffDays === 0 && newStreak === 0) {
    newStreak = 1;
  }

  await userRef.update({
    streakDays: newStreak,
    lastActive: FieldValue.serverTimestamp()
  });
}
