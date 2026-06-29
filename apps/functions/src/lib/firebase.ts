import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const firestore = admin.firestore();
firestore.settings({ ignoreUndefinedProperties: true });

export const app = admin.app();
export const db = firestore;
export const auth = admin.auth();
export const storage = admin.storage();
export const bucket = storage.bucket();

export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;
export const GeoPoint = admin.firestore.GeoPoint;
