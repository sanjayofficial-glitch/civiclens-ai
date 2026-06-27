import {
  auth,
  configureAuthPersistence,
  googleProvider,
  logOut,
  sendResetEmail,
  sendVerificationEmail,
  signInAsGuest,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from '../lib/firebase/auth';

void configureAuthPersistence();

export const AuthService = {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signInAsGuest,
  logOut,
  sendResetEmail,
  sendVerificationEmail,
  auth,
  googleProvider,
};
