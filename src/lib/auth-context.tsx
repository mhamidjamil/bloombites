'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useUser, User } from '@/firebase/auth/use-user';
import { useFirebaseAuth, useFirestore } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import {
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import useCartStore from '@/lib/cart-store';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading, error } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (name: string, email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await updateProfile(user, { displayName: name });

    const userProfile = {
      uid: user.uid,
      email: user.email,
      role: 'customer',
      name,
    };

    const userDocRef = doc(firestore, 'users', user.uid);

    setDoc(userDocRef, userProfile, { merge: true }).catch(
      async (serverError) => {
        console.error('auth-context: signup profile write failed', {
          uid: user.uid,
          code: serverError?.code,
        });
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'create',
          requestResourceData: userProfile,
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return userCredential;
  };

  const logout = () => {
    useCartStore.getState().clearCart();
    return signOut(auth);
  };

  useEffect(() => {
    if (
      !isLoading &&
      !user &&
      pathname.startsWith('/admin')
    ) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, isLoading, pathname, router]);

  useEffect(() => {
    if (error) {
      console.error('auth-context: profile load failed', error);
      toast({
        variant: 'destructive',
        title: 'Could not load your account',
        description:
          'We had trouble loading your account details. Some features may be unavailable, please refresh the page.',
      });
    }
  }, [error, toast]);

  const value = { user, loading: isLoading, error, login, logout, signup };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
