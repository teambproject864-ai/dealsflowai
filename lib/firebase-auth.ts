"use client";

import { useState, useEffect, useCallback } from "react";
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { getClientAuth, googleProvider } from "./firebase-client";

export interface AuthState {
  user: User | null;
  uid: string | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * useFirebaseAuth — Google sign-in hook.
 *
 * Wraps Firebase Auth state with loading/error handling.
 * Call `signInWithGoogle()` to open the Google OAuth popup.
 * The `uid` is stable across sessions and is stored on every
 * Firestore document written by this user.
 */
export function useFirebaseAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      getClientAuth(),
      (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      },
      (err) => {
        console.error("[Auth] onAuthStateChanged error:", err);
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      await signInWithPopup(getClientAuth(), googleProvider);
    } catch (err: any) {
      // User closed popup — not a real error
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message ?? "Google sign-in failed");
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(getClientAuth());
  }, []);

  return {
    user,
    uid: user?.uid ?? null,
    loading,
    error,
    signInWithGoogle,
    signOut,
  };
}

/**
 * getIdToken — retrieves the current user's Firebase ID token
 * to pass as `Authorization: Bearer <token>` to API routes.
 * Returns null if not signed in.
 */
export async function getIdToken(): Promise<string | null> {
  const currentUser = getClientAuth().currentUser;
  if (!currentUser) return null;
  return currentUser.getIdToken();
}
