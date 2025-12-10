import { initializeFirebase } from '@/firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';

const { firestore } = initializeFirebase();

// --- Landing Page Content ---
export interface HeroContent {
  title: string;
  subtitle: string;
  imageUrl?: string;
  imageUrls?: string[];
}

export interface FeaturedSettings {
  showPromo: boolean;
  promoImageUrl?: string;
}

export interface LandingPageData {
  hero: HeroContent;
  featured: FeaturedSettings;
}

export const getLandingPageData = async (): Promise<LandingPageData | null> => {
  const docRef = doc(firestore, 'content', 'landing-page');
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return snapshot.data() as LandingPageData;
  }
  return null;
};

export const updateLandingPageData = async (data: Partial<LandingPageData>) => {
  const docRef = doc(firestore, 'content', 'landing-page');
  await setDoc(docRef, data, { merge: true });
};

// --- Images Management ---
export interface SiteImage {
  id?: string;
  url: string;
  name: string; // or description
  description?: string;
  uploadedAt: number;
}

import { Bouquet, CustomItem, Category } from './types';

export const getSiteImages = async (): Promise<SiteImage[]> => {
  const colRef = collection(firestore, 'site_images');
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as SiteImage
  );
};

export const addSiteImage = async (image: Omit<SiteImage, 'id'>) => {
  const colRef = collection(firestore, 'site_images');
  await addDoc(colRef, image);
};

export const deleteSiteImage = async (id: string) => {
  const docRef = doc(firestore, 'site_images', id);
  await deleteDoc(docRef);
};

// --- Categories ---
export const getCategories = async (): Promise<Category[]> => {
  const colRef = collection(firestore, 'categories');
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Category
  );
};

export const addCategory = async (cat: Omit<Category, 'id'>) => {
  const colRef = collection(firestore, 'categories');
  await addDoc(colRef, cat);
};

export const deleteCategory = async (id: string) => {
  const docRef = doc(firestore, 'categories', id);
  await deleteDoc(docRef);
};

// --- Products ---
export const getBouquets = async (): Promise<Bouquet[]> => {
  const colRef = collection(firestore, 'products');
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Bouquet);
};

export const addProduct = async (product: Omit<Bouquet, 'id'>) => {
  const colRef = collection(firestore, 'products');
  // Use slug as ID or let firestore gen ID? Firestore gen ID is safer.
  // But we need slug for URL.
  await addDoc(colRef, product);
};

export const updateProduct = async (id: string, data: Partial<Bouquet>) => {
  const docRef = doc(firestore, 'products', id);
  await updateDoc(docRef, data);
};

export const deleteProduct = async (id: string) => {
  const docRef = doc(firestore, 'products', id);
  await deleteDoc(docRef);
};

// --- Custom Items ---
export const getCustomItems = async (): Promise<CustomItem[]> => {
  const colRef = collection(firestore, 'custom_items');
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as CustomItem
  );
};

export const addCustomItem = async (item: Omit<CustomItem, 'id'>) => {
  const colRef = collection(firestore, 'custom_items');
  await addDoc(colRef, item);
};

export const updateCustomItem = async (
  id: string,
  data: Partial<CustomItem>
) => {
  const docRef = doc(firestore, 'custom_items', id);
  await updateDoc(docRef, data);
};

export const deleteCustomItem = async (id: string) => {
  const docRef = doc(firestore, 'custom_items', id);
  await deleteDoc(docRef);
};
