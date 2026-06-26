import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously, signOut, updateProfile } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase/auth';

export const AuthService = {
  signInWithGoogle: async () => {
    return signInWithPopup(auth, googleProvider);
  },
  
  signInWithEmail: async (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  },
  
  signUpWithEmail: async (email: string, pass: string, displayName?: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName && credential.user) {
      await updateProfile(credential.user, { displayName });
    }
    return credential;
  },
  
  signInAsGuest: async () => {
    return signInAnonymously(auth);
  },

  logOut: async () => {
    return signOut(auth);
  }
};
