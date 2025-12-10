'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useUser, User } from '@/firebase/auth/use-user';
import { useRouter, usePathname } from 'next/navigation';
import {
  getAuth,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { errorEmitter }from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const auth = getAuth();
  const firestore = getFirestore();

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    const userProfile = {
      uid: user.uid,
      email: user.email,
      role: 'customer',
      name: user.displayName || '',
    };
    
    const userDocRef = doc(firestore, 'users', user.uid);

    setDoc(userDocRef, userProfile, { merge: true }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'create',
          requestResourceData: userProfile,
        });
        errorEmitter.emit('permission-error', permissionError);
    });


    return userCredential;
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    if (!isLoading && !user && (pathname.startsWith('/admin') || pathname === '/checkout')) {
      router.push('/login');
    }
  }, [user, isLoading, pathname, router]);

  const value = { user, loading: isLoading, login, logout, signup };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
