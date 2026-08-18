import { supabase } from './supabase';

export type CustomerEventName =
  | 'page_view'
  | 'product_clicked'
  | 'product_viewed'
  | 'size_selected'
  | 'add_to_cart'
  | 'quick_add'
  | 'signed_in';

const SESSION_KEY = 'slugsera.analytics.session-id';
const signedInUsers = new Set<string>();

function getSessionId() {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

/**
 * Records a storefront action without collecting email addresses. Admins can
 * only associate a signed-in action with an account through protected RLS.
 */
export async function trackCustomerEvent(
  eventName: CustomerEventName,
  options: {
    productId?: string;
    properties?: Record<string, string | number | boolean | null>;
    userId?: string | null;
  } = {},
) {
  const { error } = await supabase.from('customer_events').insert({
    event_name: eventName,
    product_id: options.productId ?? null,
    user_id: options.userId ?? null,
    session_id: getSessionId(),
    properties: options.properties ?? {},
  });

  // Analytics must never interrupt shopping. The dashboard still exposes an
  // actionable warning if the migration/RLS policy has not been installed.
  if (error) console.debug('Customer analytics event was not recorded:', error.message);
}

export function trackSignedInCustomer(userId: string) {
  if (signedInUsers.has(userId)) return;
  signedInUsers.add(userId);
  void trackCustomerEvent('signed_in', { userId });
}
