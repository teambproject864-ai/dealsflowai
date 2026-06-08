import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim(),
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim(),
};

/**
 * Lazily initialise the Firebase client SDK.
 *
 * We defer initialisation until the first call so that SSR renders of
 * client components (which run on the server during Next.js pre-rendering)
 * never attempt to initialise Firebase without valid config.
 *
 * The real Firebase SDK is only needed in the browser; the server-side
 * Admin SDK (lib/firebase-admin.ts) handles all server-route operations.
 */

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;
let _auth: Auth | null = null;

function getApp(): FirebaseApp {
  if (!_app) {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      throw new Error(
        '[Firebase] NEXT_PUBLIC_FIREBASE_API_KEY / PROJECT_ID are not set. ' +
        'Copy your Firebase config values into .env.local.'
      );
    }
    _app = getApps().length === 0
      ? initializeApp(firebaseConfig)
      : getApps()[0];
  }
  return _app;
}

export function getDb(): Firestore {
  if (!_db) _db = getFirestore(getApp());
  return _db;
}

export function getClientStorage(): FirebaseStorage {
  if (!_storage) _storage = getStorage(getApp());
  return _storage;
}

export function getClientAuth(): Auth {
  if (!_auth) _auth = getAuth(getApp());
  return _auth;
}

// ── Convenience exports ────────────────────────────────────────────────────────
// These are getter functions rather than direct references so that
// module-level evaluation never triggers Firebase SDK initialisation on SSR.

/** Firestore client DB — call inside useEffect / event handlers / API helpers */
export const db: Firestore = new Proxy({} as Firestore, {
  get(_t, prop) {
    return (getDb() as any)[prop];
  },
});

/** Firebase Storage client */
export const storage: FirebaseStorage = new Proxy({} as FirebaseStorage, {
  get(_t, prop) {
    return (getClientStorage() as any)[prop];
  },
});

/** Firebase Auth instance — obtained lazily */
export const auth: Auth = new Proxy({} as Auth, {
  get(_t, prop) {
    return (getClientAuth() as any)[prop];
  },
});

export const googleProvider = new GoogleAuthProvider();

const firebaseClient = { getApp, getDb, getClientAuth, getClientStorage };
export default firebaseClient;
