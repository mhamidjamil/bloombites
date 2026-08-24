import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BloomBites - Handcrafted Snack Bouquets',
    short_name: 'BloomBites',
    description: 'Handcrafted Snack Bouquets for Every Occasion',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5F5DC',
    theme_color: '#3E2723',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
