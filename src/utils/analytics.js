/**
 * Google Analytics 4 (GA4) Tracking Utility for Heralds Sri Lanka
 * Measurement ID: G-T17CFGBEFC
 */

export const trackEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, params);
    } catch (err) {
      console.warn(`[GA4] Failed to send event ${eventName}:`, err);
    }
  }
};

/**
 * Tracks SPA Route Changes
 */
export const trackPageView = (path, title) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    try {
      window.gtag('config', 'G-T17CFGBEFC', {
        page_path: path,
        page_title: title || document.title,
        page_location: window.location.href
      });
    } catch (err) {
      console.warn('[GA4] PageView tracking error:', err);
    }
  }
};

/**
 * Tracks viewing of a product collection / catalog
 */
export const trackViewItemList = (items = [], listName = 'Product Collection') => {
  trackEvent('view_item_list', {
    item_list_id: listName.toLowerCase().replace(/\s+/g, '_'),
    item_list_name: listName,
    items: items.slice(0, 20).map((p, idx) => ({
      item_id: String(p.id),
      item_name: p.name,
      item_category: p.category || 'Apparel',
      price: Number(p.price) || 0,
      currency: 'LKR',
      index: idx + 1
    }))
  });
};

/**
 * Tracks clicking on a product card to view details
 */
export const trackSelectItem = (product, listName = 'Product Grid') => {
  trackEvent('select_item', {
    item_list_name: listName,
    items: [
      {
        item_id: String(product.id),
        item_name: product.name,
        item_category: product.category || 'Apparel',
        price: Number(product.price) || 0,
        currency: 'LKR'
      }
    ]
  });
};

/**
 * Tracks product details view
 */
export const trackViewItem = (product) => {
  if (!product) return;
  trackEvent('view_item', {
    currency: 'LKR',
    value: Number(product.price) || 0,
    items: [
      {
        item_id: String(product.id),
        item_name: product.name,
        item_category: product.category || 'Apparel',
        price: Number(product.price) || 0,
        currency: 'LKR'
      }
    ]
  });
};

/**
 * Tracks WhatsApp order click (Sri Lanka high-intent conversion)
 */
export const trackWhatsAppOrder = (productName, color = 'Default', size = 'M', price = 0) => {
  trackEvent('whatsapp_click', {
    event_category: 'Lead',
    event_label: `WhatsApp Order: ${productName}`,
    product_name: productName,
    color,
    size,
    price: Number(price) || 0,
    currency: 'LKR',
    destination: '+94705700616'
  });
};

/**
 * Tracks contact channel interactions (Phone, Email, Social)
 */
export const trackContactClick = (channel, target) => {
  trackEvent('contact_click', {
    event_category: 'Contact',
    channel,
    target
  });
};

/**
 * Tracks Custom Shirt Studio generation and orders
 */
export const trackCustomOrderSubmit = (details, config) => {
  trackEvent('purchase', {
    transaction_id: `CUSTOM-${Date.now()}`,
    value: 5000,
    currency: 'LKR',
    items: [
      {
        item_id: 'custom-ai-shirt',
        item_name: `Custom Shirt - ${config?.fitType || 'Regular Fit'}`,
        item_category: 'Custom Apparel',
        price: 5000,
        currency: 'LKR'
      }
    ]
  });
};
