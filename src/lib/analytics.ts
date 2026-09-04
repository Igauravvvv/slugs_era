// Google Analytics 4 — Event Tracking for Slug's Era
// Docs: https://developers.google.com/analytics/devguides/collection/ga4

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

const GA_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || 'G-K3BM0SRVJ8';
const CONSENT_KEY = 'slugsera_cookie_consent_v1';
let analyticsInitialized = false;

function hasAnalyticsConsent() {
  try {
    return window.localStorage.getItem(CONSENT_KEY) === 'accepted';
  } catch {
    return false;
  }
}

function hasValidMeasurementId() {
  return /^G-[A-Z0-9]+$/i.test(GA_ID);
}

/** Load Google Analytics only after the visitor explicitly accepts analytics cookies. */
export function initAnalytics() {
  if (analyticsInitialized || !hasAnalyticsConsent() || !hasValidMeasurementId()) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => window.dataLayer.push(args);
  window.gtag('consent', 'default', { analytics_storage: 'granted' });
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { anonymize_ip: true, send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  script.dataset.slugseraAnalytics = 'true';
  document.head.appendChild(script);
  analyticsInitialized = true;
}

export function disableAnalytics() {
  if (!hasValidMeasurementId()) return;
  window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
  (window as Window & Record<string, unknown>)[`ga-disable-${GA_ID}`] = true;
}

/** Track a page view */
export function trackPageView(path: string, title?: string) {
  if (!window.gtag || !hasAnalyticsConsent() || !hasValidMeasurementId()) return;
  window.gtag('config', GA_ID, {
    page_path: path,
    page_title: title,
  });
}

/** Track a custom event */
export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (!window.gtag || !hasAnalyticsConsent()) return;
  window.gtag('event', eventName, params);
}

// ==========================================
// E-commerce Events (GA4 standard)
// ==========================================

export function trackViewItem(item: {
  id: string;
  name: string;
  category: string;
  price: number;
}) {
  trackEvent('view_item', {
    currency: 'INR',
    value: item.price,
    items: [{
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      price: item.price,
    }],
  });
}

export function trackAddToCart(item: {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  size: string;
}) {
  trackEvent('add_to_cart', {
    currency: 'INR',
    value: item.price * item.quantity,
    items: [{
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      price: item.price,
      quantity: item.quantity,
      item_variant: item.size,
    }],
  });
}

export function trackBeginCheckout(value: number, items: { id: string; name: string; price: number; quantity: number }[]) {
  trackEvent('begin_checkout', {
    currency: 'INR',
    value,
    items: items.map(i => ({
      item_id: i.id,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  });
}

export function trackPurchase(transactionId: string, value: number, items: { id: string; name: string; price: number; quantity: number }[]) {
  trackEvent('purchase', {
    transaction_id: transactionId,
    currency: 'INR',
    value,
    shipping: 0,
    items: items.map(i => ({
      item_id: i.id,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  });
}

export function trackSearch(searchTerm: string) {
  trackEvent('search', { search_term: searchTerm });
}

export function trackSignUp(method: string) {
  trackEvent('sign_up', { method });
}

export function trackShare(contentType: string, itemId: string) {
  trackEvent('share', { content_type: contentType, item_id: itemId });
}
