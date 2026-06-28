import { FieldValue } from '../lib/firebase';

import { BaseRepository } from './baseRepository';

export interface BackendNotificationRecord {
  userId: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: FirebaseFirestore.Timestamp;
}

export class NotificationRepository extends BaseRepository<BackendNotificationRecord> {
  constructor() {
    super('notifications');
  }

  async create(data: Omit<BackendNotificationRecord, 'read' | 'createdAt'>) {
    return this.collection().add({
      ...data,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
}
