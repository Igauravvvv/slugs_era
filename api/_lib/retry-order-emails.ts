import { sendOrderEmail, type EmailOrder } from './order-email.js';

/** Daily recovery for persisted orders whose email attempts did not succeed. */
export async function retryOrderEmails() {
  const base = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) throw new Error('Missing email retry database configuration');
  const url = new URL(`${base}/rest/v1/orders`);
  url.searchParams.set('select', 'id');
  url.searchParams.set('created_at', `gte.${new Date(Date.now() - 14 * 86400000).toISOString()}`);
  url.searchParams.set('and', '(or(payment_id.not.is.null,shipping_address->>paymentMethod.eq.COD),or(shipping_address->emailDelivery->store->>sentAt.is.null,shipping_address->emailDelivery->customer->>sentAt.is.null))');
  url.searchParams.set('status', 'neq.Cancelled');
  url.searchParams.set('order', 'created_at.asc');
  url.searchParams.set('limit', '10');
  const response = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!response.ok) throw new Error('Could not load pending email deliveries');
  const orders = await response.json() as EmailOrder[];
  const results = await Promise.all(orders.map(order => sendOrderEmail(order)));
  return { checked: orders.length, complete: results.filter(result => result.store && result.customer).length };
}
