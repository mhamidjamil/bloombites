import type { Bouquet, CustomItem, Order, Testimonial } from './types';

export const bouquets: Bouquet[] = [
  {
    id: '1',
    name: 'Chocolate Delight',
    slug: 'chocolate-delight',
    description: 'A dream come true for chocolate lovers. This bouquet is packed with a rich assortment of premium and classic chocolates.',
    price: 3500,
    images: ['chocolate-delight-1', 'chocolate-delight-2'],
    items: ['Snickers', 'KitKat', 'Dairy Milk', 'Ferrero Rocher'],
    category: 'chocolates',
    isFeatured: true,
    isEnabled: true,
  },
  {
    id: '2',
    name: 'Savory Surprise',
    slug: 'savory-surprise',
    description: 'For those who prefer a crunch! A delightful collection of popular chips and savory snacks.',
    price: 2500,
    images: ['savory-surprise-1'],
    items: ['Lays', 'Doritos', 'Kurkure', 'Pringles'],
    category: 'chips',
    isFeatured: true,
    isEnabled: true,
  },
  {
    id: '3',
    name: 'Sweet & Salty Mix',
    slug: 'sweet-salty-mix',
    description: 'The best of both worlds. A perfect balance of sweet chocolates and salty snacks to satisfy all cravings.',
    price: 3000,
    images: ['sweet-salty-1'],
    items: ['Dairy Milk', 'Lays', 'Snickers', 'Kurkure'],
    category: 'mixed',
    isFeatured: true,
    isEnabled: true,
  },
  {
    id: '4',
    name: 'Premium Celebration',
    slug: 'premium-celebration',
    description: 'Go all out with this luxurious bouquet featuring gourmet snacks, premium chocolates, and elegant add-ons.',
    price: 5000,
    images: ['premium-celebration-1'],
    items: ['Ferrero Rocher', 'Pringles', 'Almonds', 'Roses'],
    category: 'premium',
    isEnabled: true,
  },
];

export const featuredBouquets = bouquets.filter(b => b.isFeatured);

export const customItems: CustomItem[] = [
    // Chocolates
    { id: 'c1', name: 'Snickers', category: 'chocolates', price: 150, image: 'snickers-item' },
    { id: 'c2', name: 'KitKat', category: 'chocolates', price: 120, image: 'kitkat-item' },
    { id: 'c3', name: 'Dairy Milk', category: 'chocolates', price: 200, image: 'https://picsum.photos/seed/dairymilk/200/200' },
    { id: 'c4', name: 'Ferrero Rocher (3pc)', category: 'chocolates', price: 300, image: 'https://picsum.photos/seed/ferrerorocher/200/200' },

    // Snacks
    { id: 's1', name: 'Lays', category: 'snacks', price: 100, image: 'lays-item' },
    { id: 's2', name: 'Doritos', category: 'snacks', price: 150, image: 'doritos-item' },
    { id: 's3', name: 'Kurkure', category: 'snacks', price: 80, image: 'https://picsum.photos/seed/kurkure/200/200' },
    { id: 's4', name: 'Pringles', category: 'snacks', price: 400, image: 'https://picsum.photos/seed/pringles/200/200' },

    // Dry Fruits
    { id: 'd1', name: 'Almonds (100g)', category: 'dry-fruits', price: 500, image: 'almonds-item' },
    { id: 'd2', name: 'Cashews (100g)', category: 'dry-fruits', price: 600, image: 'https://picsum.photos/seed/cashews/200/200' },

    // Notes / Cards
    { id: 'n1', name: 'Birthday Card', category: 'notes-cards', price: 250, image: 'birthday-card-item' },
    { id: 'n2', name: 'Anniversary Card', category: 'notes-cards', price: 250, image: 'https://picsum.photos/seed/anniversarycard/200/200' },

    // Premium Add-Ons
    { id: 'p1', name: 'Small Teddy Bear', category: 'premium-add-ons', price: 800, image: 'teddy-bear-item' },
    { id: 'p2', name: 'LED Fairy Lights', category: 'premium-add-ons', price: 400, image: 'led-lights-item' },
    { id: 'p3', name: 'Single Rose', category: 'premium-add-ons', price: 300, image: 'https://picsum.photos/seed/rose/200/200' },
];

export const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "Absolutely stunning bouquet! It was the perfect birthday gift and my friend loved it. The delivery was super fast too.",
    author: "Aisha Khan"
  },
  {
    id: 2,
    quote: "I ordered a custom bouquet and the process was so easy and fun. The final product exceeded my expectations. Highly recommend BloomBites!",
    author: "Bilal Ahmed"
  },
  {
    id: 3,
    quote: "The quality of the snacks and the presentation are top-notch. It's my go-to place for gifts now. Fantastic service!",
    author: "Fatima Ali"
  }
];

export const orders: Order[] = [
    {
        id: 'ORD001',
        userId: 'USR001',
        items: [],
        totalAmount: 3500,
        shippingAddress: {
            street: '123 Gulberg',
            city: 'Lahore',
            province: 'Punjab',
            postalCode: '54000',
        },
        customerDetails: {
            name: 'Aisha Khan',
            email: 'aisha@example.com',
            phone: '03001234567'
        },
        status: 'completed',
        orderDate: new Date('2023-10-26'),
    },
    {
        id: 'ORD002',
        userId: 'USR002',
        items: [],
        totalAmount: 2500,
        shippingAddress: {
            street: '456 DHA Phase 6',
            city: 'Karachi',
            province: 'Sindh',
            postalCode: '75500',
        },
        customerDetails: {
            name: 'Bilal Ahmed',
            email: 'bilal@example.com',
            phone: '03217654321'
        },
        status: 'processing',
        orderDate: new Date('2023-10-28'),
    },
];
