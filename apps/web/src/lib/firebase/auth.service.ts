import {
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';

import { app } from './firebase';

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function configureAuthPersistence() {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (error) {
    console.warn('Firebase Auth persistence could not be enabled.', error);
  }
}

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string,
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  if (displayName && credential.user) {
    await updateProfile(credential.user, { displayName });
  }

  return credential;
}

export function signInAsGuest() {
  return signInAnonymously(auth);
}

export function logOut() {
  return signOut(auth);
}

export function sendVerificationEmail() {
  if (!auth.currentUser) {
    throw new Error('No signed-in user is available for email verification.');
  }

  return sendEmailVerification(auth.currentUser);
}

export function sendResetEmail(email: string) {
  return sendPasswordResetEmail(auth, email);
}
