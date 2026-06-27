import { FieldValue, auth } from '../lib/firebase';
import { fail } from '../lib/errors';
import type { BackendRole, AuthPrincipal } from '../types';
import { UserRepository } from '../repositories/userRepository';

const userRepository = new UserRepository();

export function normalizeRole(role: unknown): BackendRole {
  if (role === 'citizen' || role === 'moderator' || role === 'official' || role === 'government' || role === 'admin') {
    return role;
  }

  return 'citizen';
}

export function isPrivilegedRole(role: BackendRole) {
  return role === 'moderator' || role === 'official' || role === 'government' || role === 'admin';
}

export async function ensureBackendProfile(principal: AuthPrincipal) {
  const userRecord = await auth.getUser(principal.uid);
  const role = normalizeRole(userRecord.customClaims?.role ?? principal.role);
  const profile = {
    uid: principal.uid,
    displayName: userRecord.displayName || 'Anonymous Citizen',
    email: userRecord.email || principal.email || '',
    photoURL: userRecord.photoURL ?? null,
    phoneNumber: userRecord.phoneNumber ?? null,
    role,
    reputation: 0,
    badges: [],
    streakDays: 0,
    lastActive: FieldValue.serverTimestamp(),
    fcmTokens: [],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await userRepository.doc(principal.uid).set(profile, { merge: true });
  await auth.setCustomUserClaims(principal.uid, { role });

  return profile;
}

export async function updateUserRole(uid: string, role: BackendRole) {
  if (!role) {
    fail('invalid-argument', 'A valid role is required.');
  }

  await auth.setCustomUserClaims(uid, { role });
  await userRepository.upsert(uid, {
    role,
  });
}

