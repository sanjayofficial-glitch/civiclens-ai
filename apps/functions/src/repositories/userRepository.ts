import { FieldValue } from '../lib/firebase';

import { BaseRepository } from './baseRepository';

export interface BackendUserRecord {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  phoneNumber: string | null;
  role: string;
  reputation: number;
  badges: string[];
  streakDays: number;
  lastActive: FirebaseFirestore.Timestamp;
  location?: FirebaseFirestore.GeoPoint;
  fcmTokens: string[];
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export class UserRepository extends BaseRepository<BackendUserRecord> {
  constructor() {
    super('users');
  }

  async upsert(uid: string, data: Partial<BackendUserRecord>) {
    await this.doc(uid).set(
      {
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }
}
