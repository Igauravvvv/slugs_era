// Google Analytics 4 — Event Tracking for Slug's Era
// Docs: https://developers.google.com/analytics/devguides/collection/ga4

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

const CONFIGURED_GA_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || '';
const GA_ID = CONFIGURED_GA_ID === 'G-XXXXXXXXXX' ? 'G-K3BM0SRVJ8' : CONFIGURED_GA_ID || 'G-K3BM0SRVJ8';
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

function updateConsent(granted: boolean) {
  window.gtag('consent', 'update', {
    analytics_storage: granted ? 'granted' : 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
}

/** Initialize advanced consent mode. Without consent, events remain cookieless. */
export function initAnalytics() {
  if (!hasValidMeasurementId()) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || ((...args: unknown[]) => window.dataLayer.push(args));
  (window as Window & Record<string, unknown>)[`ga-disable-${GA_ID}`] = false;
  updateConsent(hasAnalyticsConsent());

  if (analyticsInitialized) return;
  window.gtag('config', GA_ID, { anonymize_ip: true, send_page_view: false });
  analyticsInitialized = true;
  window.dispatchEvent(new Event('slugsera:analytics-ready'));
}

export function disableAnalytics() {
  if (!hasValidMeasurementId() || !window.gtag) return;
  updateConsent(false);
}

/** Track a page view */
export function trackPageView(path: string, title?: string) {
  if (!window.gtag || !hasValidMeasurementId()) return;
  window.gtag('config', GA_ID, {
    page_path: path,
    page_title: title,
  });
}

/** Track a custom event */
export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (!window.gtag || !hasValidMeasurementId()) return;
  window.gtag('event', eventName, params);
}

export function isAnalyticsEnabled() {
  return Boolean(window.gtag && hasValidMeasurementId());
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

export function trackViewCart(value: number, items: { id: string; name: string; price: number; quantity: number }[]) {
  trackEvent('view_cart', {
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

export function trackRemoveFromCart(item: {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  size: string;
}) {
  trackEvent('remove_from_cart', {
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
