import { z } from 'zod';

import { timestampSchema } from './common.js';
import { notificationTypeSchema } from './enums.js';

export const notificationSchema = z.object({
  userId: z.string().min(1),
  type: notificationTypeSchema,
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  data: z.record(z.unknown()),
  read: z.boolean(),
  createdAt: timestampSchema,
});

export const createNotificationSchema = notificationSchema.omit({
  read: true,
  createdAt: true,
});

export type Notification = z.infer<typeof notificationSchema>;
export type CreateNotification = z.infer<typeof createNotificationSchema>;
