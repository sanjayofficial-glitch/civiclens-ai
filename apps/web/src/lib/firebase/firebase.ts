import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from './config';

// Singleton initialization
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
