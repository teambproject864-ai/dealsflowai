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

function getApp(): FirebaseApp | null {
  if (!_app) {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.warn('[Firebase] NEXT_PUBLIC_FIREBASE_API_KEY / PROJECT_ID are not set. Using demo mode.');
      return null;
    }
    _app = getApps().length === 0
      ? initializeApp(firebaseConfig)
      : getApps()[0];
  }
  return _app;
}

export function getDb(): Firestore | null {
  if (!_db) {
    const app = getApp();
    if (app) {
      _db = getFirestore(app);
    } else {
      return null;
    }
  }
  return _db;
}

export function getClientStorage(): FirebaseStorage | null {
  if (!_storage) {
    const app = getApp();
    if (app) {
      _storage = getStorage(app);
    } else {
      return null;
    }
  }
  return _storage;
}

export function getClientAuth(): Auth | null {
  if (!_auth) {
    const app = getApp();
    if (app) {
      _auth = getAuth(app);
    } else {
      return null;
    }
  }
  return _auth;
}

// ── Convenience exports ────────────────────────────────────────────────────────
// These are getter functions rather than direct references so that
// module-level evaluation never triggers Firebase SDK initialisation on SSR.

/** Firestore client DB — call inside useEffect / event handlers / API helpers */
export const db: Firestore = new Proxy({} as Firestore, {
  get(_t, prop) {
    const firestore = getDb();
    if (!firestore) {
      // Return a mock function that does nothing for all properties accessed
      return () => {};
    }
    return (firestore as any)[prop];
  },
});

/** Firebase Storage client */
export const storage: FirebaseStorage = new Proxy({} as FirebaseStorage, {
  get(_t, prop) {
    const firebaseStorage = getClientStorage();
    if (!firebaseStorage) {
      return () => {};
    }
    return (firebaseStorage as any)[prop];
  },
});

/** Firebase Auth instance — obtained lazily */
export const auth: Auth = new Proxy({} as Auth, {
  get(_t, prop) {
    const firebaseAuth = getClientAuth();
    if (!firebaseAuth) {
      return () => {};
    }
    return (firebaseAuth as any)[prop];
  },
});

export const googleProvider = new GoogleAuthProvider();

const firebaseClient = { getApp, getDb, getClientAuth, getClientStorage };
export default firebaseClient;
