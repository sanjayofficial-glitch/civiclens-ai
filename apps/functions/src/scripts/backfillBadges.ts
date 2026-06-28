import * as admin from 'firebase-admin';

// Initialize the Firebase Admin SDK if it hasn't been already
if (admin.apps.length === 0) {
  admin.initializeApp();
}

import { checkAndAwardBadges } from '../services/badgeService';

async function backfillBadges() {
  console.log('Starting badge backfill...');

  const db = admin.firestore();

  // First, we need to ensure users' issue counters match reality
  console.log('Counting actual issues per user...');
  const issuesSnap = await db.collection('issues').get();

  const userIssueCounts = new Map<string, number>();

  issuesSnap.forEach((doc) => {
    const data = doc.data() as { reporterId?: string };
    if (data.reporterId) {
      userIssueCounts.set(
        data.reporterId,
        (userIssueCounts.get(data.reporterId) ?? 0) + 1,
      );
    }
  });

  // Now update users and award badges
  console.log(`Found ${String(userIssueCounts.size)} users with issues.`);

  for (const [userId, count] of userIssueCounts.entries()) {
    console.log(
      `Processing user ${userId} with ${String(count)} reported issues...`,
    );

    // Ensure the counter is accurate
    await db.collection('users').doc(userId).set(
      {
        issuesReported: count,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    // Re-evaluate badges
    await checkAndAwardBadges(userId);
    console.log(`Finished evaluating badges for ${userId}`);
  }

  console.log('Badge backfill complete!');
  process.exit(0);
}

backfillBadges().catch((err: unknown) => {
  console.error('Error backfilling badges:', err);
  process.exit(1);
});
