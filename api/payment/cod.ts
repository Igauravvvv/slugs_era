import { waitUntil } from '@vercel/functions';
import { sendOrderEmail } from '../_lib/order-email.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { priceCheckout } from '../_lib/checkout.js';

// COD uses the existing order schema and requires no payment-provider credentials.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !anonKey || !serviceKey) throw new Error('Checkout is not configured.');
    const authorization = req.headers.authorization;
    if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Please sign in before checking out.' });
    }
    const auth = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anonKey, Authorization: authorization } });
    if (!auth.ok) return res.status(401).json({ success: false, error: 'Your session expired. Please sign in again.' });
    const user = await auth.json() as { id: string; email?: string };
    const { requestId, shippingAddress: address, customerName, customerPhone } = req.body || {};
    const validText = (value: unknown, max: number) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
    if (typeof requestId !== 'string' || !/^[a-f0-9-]{36}$/i.test(requestId)
      || !validText(customerName, 150) || typeof customerPhone !== 'string' || !/^(?:\+91[ -]?)?[6-9]\d{9}$/.test(customerPhone.trim())
      || !address || !validText(address.street, 500) || !validText(address.city, 100)
      || !validText(address.state, 100) || !/^[1-9]\d{5}$/.test(address.pincode) || address.country !== 'India') {
      return res.status(400).json({ success: false, error: 'Please provide a valid name, Indian mobile number and complete delivery address.' });
    }
    // A deterministic primary key makes concurrent submissions and network retries safe.
    const hash = crypto.createHash('sha256').update(`${user.id}:${requestId}`).digest('hex');
    const id = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
    const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' };
    const lookup = `${url}/rest/v1/orders?id=eq.${id}&user_id=eq.${user.id}&select=*`;
    const readOrder = async () => {
      const response = await fetch(lookup, { headers });
      if (!response.ok) throw new Error('Could not check your order. Please retry.');
      return (await response.json() as Array<Record<string, any>>)[0];
    };
    const respond = (order: Record<string, any>) => res.status(200).json({ success: true, data: { order, orderNumber: order.order_number } });
    const existing = await readOrder();
    if (existing) { waitUntil(sendOrderEmail(existing as any)); return respond(existing); }
    const checkout = await priceCheckout(req.body.items, { url, serviceKey, userId: user.id, promoCodes: req.body.promoCodes });
    const payload = {
      id, order_number: `SLG-${hash.slice(0, 10).toUpperCase()}`, user_id: user.id,
      shipping_address: {
        street: address.street.trim(), city: address.city.trim(), state: address.state.trim(),
        pincode: address.pincode, country: 'India', fullName: customerName.trim(), phone: customerPhone.trim(), email: user.email || null,
        paymentMethod: 'COD', paymentStatus: 'Pending', promoCodes: checkout.promoCodes,
        launchDiscount: checkout.launchDiscount, welcomeDiscount: checkout.welcomeDiscount, privateDiscount: checkout.privateDiscount,
        couponDiscount: checkout.couponDiscount,
      },
      items: checkout.items, subtotal: checkout.subtotal, total: checkout.total, status: 'Pending', payment_id: null,
    };
    const response = await fetch(`${url}/rest/v1/orders?select=*`, {
      method: 'POST', headers: { ...headers, Prefer: 'return=representation' }, body: JSON.stringify(payload),
    });
    if (response.status === 409) {
      const saved = await readOrder();
      if (saved) { waitUntil(sendOrderEmail(saved as any)); return respond(saved); }
    }
    if (!response.ok) throw new Error('Your COD order could not be saved. Please retry.');
    const [order] = await response.json();
    // Order persistence must not depend on notification availability.
    waitUntil(fetch(`${url}/rest/v1/notifications`, {
      method: 'POST', headers, body: JSON.stringify({ type: 'new_order', title: 'You received a COD order',
        message: `Order ${order.order_number} — ₹${order.total} due on delivery`,
        metadata: { order_id: order.id, order_number: order.order_number, total: order.total } }),
    }).catch(() => undefined));
    waitUntil(sendOrderEmail(order));
    return respond(order);
  } catch (error: unknown) {
    const failure = error as { statusCode?: number; message?: string };
    return res.status(failure.statusCode || 500).json({ success: false, error: failure.message || 'Could not place your COD order.' });
  }
}
