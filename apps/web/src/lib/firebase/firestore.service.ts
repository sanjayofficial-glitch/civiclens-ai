import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  enableIndexedDbPersistence,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type CollectionReference,
  type DocumentReference,
  type Firestore,
  type Query,
} from 'firebase/firestore';

import { app } from './firebase';

export const db = getFirestore(app);

export const firestoreFieldValue = {
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
};

export async function enableFirestorePersistence() {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    await enableIndexedDbPersistence(db);
    return true;
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === 'failed-precondition') {
      console.warn(
        'Firestore offline persistence is only available in one tab at a time.',
      );
      return false;
    }

    if (code === 'unimplemented') {
      console.warn(
        'Firestore offline persistence is not supported in this browser.',
      );
      return false;
    }

    console.warn('Firestore offline persistence could not be enabled.', error);
    return false;
  }
}

void enableFirestorePersistence();

export {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
};

export type {
  CollectionReference,
  DocumentReference,
  Firestore,
  Query,
};
