import { useEffect } from 'react';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://heralds-fe.vercel.app';
const DEFAULT_IMAGE = `${SITE_URL}/favicon.png`;

/**
 * Dynamic SEO Component for Heralds Sri Lanka
 * Updates Document Title, Meta tags, Open Graph, Twitter Cards, Canonical URL, and JSON-LD structured data.
 */
export default function SEO({
  title = "Heralds Sri Lanka | Premium Printed Shirts & Men's Fashion",
  description = "Discover unique printed shirts and stylish men's fashion from Heralds, a Sri Lankan clothing brand. Explore our latest collections and order online with islandwide delivery.",
  canonical = '',
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  keywords = "Printed Shirts Sri Lanka, Men's Shirts Sri Lanka, Men's Fashion Sri Lanka, Buy Shirts Online Sri Lanka, Casual Shirts Sri Lanka, Online Clothing Store Sri Lanka, Sri Lankan Clothing Brand",
  schema = null,
  noindex = false
}) {
  useEffect(() => {
    // 1. Title
    document.title = title;

    // Helper to create or update meta tags
    const setMetaTag = (attribute, attrValue, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attribute}="${attrValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attribute, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper to create or update link tags
    const setLinkTag = (rel, href) => {
      if (!href) return;
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // 2. Canonical URL
    const fullCanonical = canonical.startsWith('http')
      ? canonical
      : `${SITE_URL}${canonical.startsWith('/') ? canonical : `/${canonical}`}`;
    setLinkTag('canonical', fullCanonical);

    // 3. Standard Metadata
    setMetaTag('name', 'description', description);
    if (keywords) setMetaTag('name', 'keywords', keywords);
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');

    // 4. Open Graph Tags
    setMetaTag('property', 'og:site_name', 'Heralds Sri Lanka');
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', fullCanonical);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:locale', 'en_LK');

    // 5. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    // 6. JSON-LD Structured Data
    let schemaScript = document.getElementById('dynamic-jsonld');
    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'dynamic-jsonld';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schema);
    } else if (schemaScript) {
      schemaScript.remove();
    }
  }, [title, description, canonical, ogImage, ogType, keywords, schema, noindex]);

  return null;
}
