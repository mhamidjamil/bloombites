'use client';
import { User as FirebaseUser, onIdTokenChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '../provider';
import {
  doc,
  DocumentReference,
  onSnapshot,
  FirestoreError,
} from 'firebase/firestore';
import { useFirestore } from '..';

export interface User extends FirebaseUser {
  role?: 'admin' | 'customer';
}

export function useUser() {
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubDoc: (() => void) | undefined;

    const unsubscribe = onIdTokenChanged(auth, (firebaseUser) => {
      unsubDoc?.();
      unsubDoc = undefined;

      if (firebaseUser) {
        setError(null);
        const userDocRef = doc(
          firestore,
          'users',
          firebaseUser.uid
        ) as DocumentReference;

        unsubDoc = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setUser({
                ...firebaseUser,
                ...data,
                role: data.role as 'admin' | 'customer' | undefined,
              });
            } else {
              setUser({ ...firebaseUser, role: undefined });
            }
            setIsLoading(false);
          },
          (err: FirestoreError) => {
            console.error('use-user: profile snapshot failed', {
              uid: firebaseUser.uid,
              code: err.code,
            });
            setError(err);
            setUser(firebaseUser);
            setIsLoading(false);
          }
        );
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribe();
      unsubDoc?.();
    };
  }, [auth, firestore]);

  return { user, isLoading, error };
}
