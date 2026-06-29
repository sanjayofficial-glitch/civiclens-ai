import type { FirebaseOptions } from 'firebase/app';

type FirebaseEnvKey =
  | 'VITE_FIREBASE_API_KEY'
  | 'VITE_FIREBASE_AUTH_DOMAIN'
  | 'VITE_FIREBASE_PROJECT_ID'
  | 'VITE_FIREBASE_STORAGE_BUCKET'
  | 'VITE_FIREBASE_MESSAGING_SENDER_ID'
  | 'VITE_FIREBASE_APP_ID';

const FIREBASE_ENV_KEYS: FirebaseEnvKey[] = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

function readEnv(key: FirebaseEnvKey) {
  return (import.meta.env[key] as string | undefined)?.trim() || undefined;
}

export function getFirebaseConfig() {
  const config = {
    apiKey: readEnv('VITE_FIREBASE_API_KEY'),
    authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: readEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: readEnv('VITE_FIREBASE_APP_ID'),
  } satisfies FirebaseOptions;

  const missingKeys = FIREBASE_ENV_KEYS.filter((key) => !readEnv(key));
  if (missingKeys.length > 0) {
    const message = [
      'Firebase configuration is incomplete.',
      `Missing environment variables: ${missingKeys.join(', ')}`,
      'Check your Vite env files and Firebase project settings.',
    ].join(' ');

    throw new Error(message);
  }

  return config;
}

export const firebaseConfig = getFirebaseConfig();
