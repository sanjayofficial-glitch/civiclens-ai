import { FieldValue } from '../lib/firebase';
import { db } from '../lib/firebase';

export async function adjustReputation(uid: string, delta: number) {
  await db.collection('users').doc(uid).set(
    {
      reputation: FieldValue.increment(delta),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

