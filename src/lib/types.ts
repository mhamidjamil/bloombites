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
  postalCode: string;
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

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  shippingAddress: Address;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  status: 'processing' | 'completed' | 'cancelled';
  orderDate: Date;
};

export type Testimonial = {
  id: number;
  quote: string;
  author: string;
};
