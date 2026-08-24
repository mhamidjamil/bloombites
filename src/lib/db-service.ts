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
  where,
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

import {
  Bouquet,
  CustomItem,
  Category,
  BouquetStyle,
  CartItem,
  CustomBouquet,
  Order,
  OrderStatus,
  Address,
  SHIPPING_FEE,
} from './types';

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

// --- Slugs ---
export const slugify = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');

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

export const updateCategory = async (id: string, data: Partial<Category>) => {
  const docRef = doc(firestore, 'categories', id);
  await updateDoc(docRef, data);
};

export const deleteCategory = async (id: string) => {
  const docRef = doc(firestore, 'categories', id);
  await deleteDoc(docRef);
};

// Counts products and custom items currently referencing a category slug,
// used to block deleting a category that's still in use.
export const countCategoryUsage = async (slug: string): Promise<number> => {
  const productsQuery = query(
    collection(firestore, 'products'),
    where('category', '==', slug)
  );
  const itemsQuery = query(
    collection(firestore, 'custom_items'),
    where('category', '==', slug)
  );
  const [productsSnapshot, itemsSnapshot] = await Promise.all([
    getDocs(productsQuery),
    getDocs(itemsQuery),
  ]);
  return productsSnapshot.size + itemsSnapshot.size;
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

// --- Bouquet Styles ---
export const getBouquetStyles = async (): Promise<BouquetStyle[]> => {
  const colRef = collection(firestore, 'bouquet_styles');
  const q = query(colRef, orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as BouquetStyle
  );
};

export const addBouquetStyle = async (style: Omit<BouquetStyle, 'id'>) => {
  const colRef = collection(firestore, 'bouquet_styles');
  await addDoc(colRef, style);
};

export const updateBouquetStyle = async (
  id: string,
  data: Partial<BouquetStyle>
) => {
  const docRef = doc(firestore, 'bouquet_styles', id);
  await updateDoc(docRef, data);
};

export const deleteBouquetStyle = async (id: string) => {
  const docRef = doc(firestore, 'bouquet_styles', id);
  await deleteDoc(docRef);
};

// --- Orders ---
export interface CreateOrderInput {
  userId: string | null;
  items: CartItem[];
  customerDetails: Order['customerDetails'];
  shippingAddress: Address;
}

const generateOrderNumber = () => `BB-${Date.now().toString(36).toUpperCase()}`;

export const createOrder = async (input: CreateOrderInput): Promise<Order> => {
  const orderItems = input.items.map((cartItem) => {
    const isCustom = cartItem.product.id === 'custom-bouquet';
    return {
      name: cartItem.product.name,
      price: cartItem.product.price,
      quantity: cartItem.quantity,
      isCustom,
      ...(isCustom && (cartItem.product as CustomBouquet).description
        ? { details: (cartItem.product as CustomBouquet).description }
        : {}),
    };
  });
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const orderData: Omit<Order, 'id'> = {
    orderNumber: generateOrderNumber(),
    userId: input.userId,
    items: orderItems,
    subtotal,
    shippingFee: SHIPPING_FEE,
    totalAmount: subtotal + SHIPPING_FEE,
    shippingAddress: input.shippingAddress,
    customerDetails: input.customerDetails,
    status: 'Pending',
    orderDate: new Date().toISOString(),
  };

  const colRef = collection(firestore, 'orders');
  const docRef = await addDoc(colRef, orderData);
  return { id: docRef.id, ...orderData };
};

export const getOrders = async (): Promise<Order[]> => {
  const colRef = collection(firestore, 'orders');
  const q = query(colRef, orderBy('orderDate', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Order);
};

export const getOrdersByUser = async (uid: string): Promise<Order[]> => {
  const colRef = collection(firestore, 'orders');
  const q = query(colRef, where('userId', '==', uid));
  const snapshot = await getDocs(q);
  const results = snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Order
  );
  return results.sort((a, b) => (a.orderDate < b.orderDate ? 1 : -1));
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  const docRef = doc(firestore, 'orders', id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Order;
};

export const updateOrderStatus = async (id: string, status: OrderStatus) => {
  const docRef = doc(firestore, 'orders', id);
  await updateDoc(docRef, { status });
};
