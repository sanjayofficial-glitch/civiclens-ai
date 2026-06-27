import { FieldValue } from '../lib/firebase';
import { NotificationRepository } from '../repositories/notificationRepository';

const notifications = new NotificationRepository();

export async function createNotification(input: {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}) {
  return notifications.create({
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    data: input.data ?? {},
  });
}

export async function markNotificationRead(notificationId: string) {
  await notifications.doc(notificationId).update({
    read: true,
    readAt: FieldValue.serverTimestamp(),
  });
}

