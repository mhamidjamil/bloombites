export type User = {
  uid: string;
  email: string;
  role: 'customer' | 'admin';
  name?: string;
  addresses?: Address[];
};

export type Address = {
  street: string;
  city: string;
  province: string;
  postalCode?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  type: 'product' | 'item';
};

export type Bouquet = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[]; // URLs to images
  items: string[];
  category: string;
  isFeatured?: boolean;
  isEnabled: boolean;
};

// Item for custom bouquet builder
export type ItemVariant = {
  name: string;
  price: number;
};

export type CustomItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string; // Primary image (for backward compatibility)
  images?: string[]; // Multiple images (new)
  variants?: ItemVariant[];
};

export type BouquetStyle = {
  id: string;
  name: string;
  description: string;
  image?: string;
  price: number;
  isEnabled?: boolean;
};

export type CartItem = {
  id: string; // Unique ID for the cart item instance
  product: Bouquet | CustomBouquet;
  quantity: number;
};

export type CustomBouquet = {
  id: 'custom-bouquet';
  name: string;
  description: string;
  price: number;
  items: CustomItem[];
  instructions?: string;
};

// Shipping is flat-rate for now; centralized here so cart, checkout and
// order totals never drift apart.
export const SHIPPING_FEE = 250;

export type OrderStatus = 'Pending' | 'Processing' | 'Completed' | 'Cancelled';

// Snapshot of a cart line at the time an order was placed, so later edits to
// a product's name/price never change what the customer actually ordered.
export type OrderItem = {
  name: string;
  price: number;
  quantity: number;
  isCustom: boolean;
  details?: string; // custom bouquet contents / style / instructions, if any
};

export type Order = {
  id: string;
  orderNumber: string;
  userId: string | null; // null for guest checkout
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  shippingAddress: Address;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  status: OrderStatus;
  orderDate: string; // ISO string
};

export type Testimonial = {
  id: number;
  quote: string;
  author: string;
};
