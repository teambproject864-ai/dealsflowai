"use client";

import { useState, useEffect } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  QueryConstraint,
  DocumentData,
} from "firebase/firestore";
import { getDb } from "./firebase-client";

/**
 * useFirestoreCollection
 *
 * Real-time listener for a Firestore collection.
 * Returns `{ data, loading, error }`.
 *
 * Falls back to `fallback` data when the collection is empty,
 * so 3D scenes always have something to render on first load.
 */
export function useFirestoreCollection<T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  fallback: T[] = []
): { data: T[]; loading: boolean; error: string | null } {
  const [data, setData] = useState<T[]>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // First set fallback data immediately
    setData(fallback);
    setLoading(true);
    let unsubscribe: (() => void) | null = null;

    const timer = setTimeout(() => {
      setLoading(false);
      console.warn(`[Firestore] ${collectionName} listener timed out after 8s, fallback triggered`);
    }, 8000);

    try {
      const firestore = getDb();
      if (!firestore) {
        clearTimeout(timer);
        console.log(`[Firestore] Not configured, using fallback for ${collectionName}`);
        setData(fallback);
        setLoading(false);
        return;
      }

      const q = query(collection(firestore, collectionName), ...constraints);
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          clearTimeout(timer);
          const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as T));
          setData(docs.length > 0 ? docs : fallback);
          setLoading(false);
          setError(null);
        },
        (err) => {
          clearTimeout(timer);
          // Don't log permission errors to avoid console spam, just use fallback
          if (!err.message.includes("Missing or insufficient permissions")) {
            console.error(`[Firestore] ${collectionName} listener error:`, err);
          }
          // On error (e.g. unauthenticated), show fallback so the 3D scene still renders
          setData(fallback);
          setLoading(false);
          setError(null); // Don't show error state to avoid breaking UI
        }
      );
    } catch (err) {
      clearTimeout(timer);
      // If Firestore init fails, use fallback data
      setData(fallback);
      setLoading(false);
      setError(null);
    }

    return () => {
      clearTimeout(timer);
      if (unsubscribe) {
        unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName]);

  return { data, loading, error };
}

/**
 * useFirestoreDoc
 *
 * Real-time listener for a single Firestore document.
 * Returns `{ data, loading, error }`.
 */
export function useFirestoreDoc<T extends DocumentData>(
  path: string
): { data: T | null; loading: boolean; error: string | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path) return;
    let unsubscribe: (() => void) | null = null;
    
    try {
      const firestore = getDb();
      if (!firestore) {
        console.log(`[Firestore] Not configured, using fallback for doc(${path})`);
        setData(null);
        setLoading(false);
        return;
      }

      const ref = doc(firestore, path);
      unsubscribe = onSnapshot(
        ref,
        (snap) => {
          setData(snap.exists() ? ({ id: snap.id, ...snap.data() } as unknown as T) : null);
          setLoading(false);
          setError(null);
        },
        (err) => {
          if (!err.message.includes("Missing or insufficient permissions")) {
            console.error(`[Firestore] doc(${path}) listener error:`, err);
          }
          setData(null);
          setLoading(false);
          setError(null);
        }
      );
    } catch (err) {
      setData(null);
      setLoading(false);
      setError(null);
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [path]);

  return { data, loading, error };
}
