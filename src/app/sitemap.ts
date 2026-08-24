import type { MetadataRoute } from 'next';
import { SITE_URL } from './layout';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/shop', '/build', '/about', '/contact'];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));
}
