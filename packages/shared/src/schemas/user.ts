import { z } from 'zod';

import { geoPointSchema, timestampSchema } from './common.js';
import { userRoleSchema } from './enums.js';

export const userSchema = z.object({
  uid: z.string().min(1),
  displayName: z.string().min(1).max(100),
  email: z.string().email(),
  photoURL: z.string().url().nullable(),
  phoneNumber: z.string().nullable(),
  role: userRoleSchema,
  reputation: z.number().int(),
  issuesReported: z.number().int().default(0),
  issuesVerified: z.number().int().default(0),
  badges: z.array(z.string()),
  streakDays: z.number().int().nonnegative(),
  lastActive: timestampSchema,
  location: geoPointSchema.optional(),
  fcmTokens: z.array(z.string()).optional().default([]),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const createUserSchema = userSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export const updateUserSchema = createUserSchema.partial();

export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
