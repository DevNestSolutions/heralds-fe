import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = process.env.VITE_SITE_URL || 'https://heralds-fe.vercel.app';

// Static Routes with SEO Priority & Change Frequency
const routes = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/products', priority: '0.9', changefreq: 'daily' },
  { url: '/customizable', priority: '0.8', changefreq: 'weekly' },
  { url: '/about', priority: '0.7', changefreq: 'monthly' },
  { url: '/contact', priority: '0.7', changefreq: 'monthly' }
];

// Add Category routes
const categories = ['Shirts', 'T-Shirts', 'Hoodies', 'Pants', 'Shorts'];
categories.forEach(cat => {
  routes.push({
    url: `/products?category=${encodeURIComponent(cat)}`,
    priority: '0.8',
    changefreq: 'weekly'
  });
});

// Add Product routes
let productIds = [1];
try {
  const productsJsonPath = path.resolve(__dirname, '../../backend/products.json');
  if (fs.existsSync(productsJsonPath)) {
    const raw = fs.readFileSync(productsJsonPath, 'utf-8');
    const products = JSON.parse(raw);
    if (Array.isArray(products) && products.length > 0) {
      productIds = products.map(p => p.id);
    }
  }
} catch (e) {
  console.warn('Could not read backend/products.json, using fallback product ID [1]:', e.message);
}

productIds.forEach(id => {
  routes.push({
    url: `/product/${id}`,
    priority: '0.85',
    changefreq: 'weekly'
  });
});

const today = new Date().toISOString().split('T')[0];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${routes
  .map(
    r => `  <url>
    <loc>${SITE_URL}${r.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

const publicPath = path.resolve(__dirname, '../public/sitemap.xml');
fs.writeFileSync(publicPath, sitemapXml, 'utf-8');
console.log(`Generated sitemap with ${routes.length} URLs at ${publicPath}`);

const distPath = path.resolve(__dirname, '../dist/sitemap.xml');
if (fs.existsSync(path.dirname(distPath))) {
  fs.writeFileSync(distPath, sitemapXml, 'utf-8');
  console.log(`Updated dist sitemap at ${distPath}`);
}
