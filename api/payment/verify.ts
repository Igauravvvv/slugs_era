import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { parsePromoCodes, priceCheckout } from '../_lib/checkout.js';

function config() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey || !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw Object.assign(new Error('Checkout is not configured.'), { statusCode: 500 });
  }
  return {
    url,
    anonKey,
    serviceKey,
    razorpayId: process.env.RAZORPAY_KEY_ID,
    razorpaySecret: process.env.RAZORPAY_KEY_SECRET,
  };
}

async function authenticate(header: string | string[] | undefined) {
  const token = typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) throw Object.assign(new Error('Please sign in before checking out.'), { statusCode: 401 });
  const { url, anonKey } = config();
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw Object.assign(new Error('Your session expired. Please sign in again.'), { statusCode: 401 });
  return response.json() as Promise<{ id: string; email?: string; user_metadata?: Record<string, unknown> }>;
}

function checkoutHash(userId: string, checkout: Awaited<ReturnType<typeof priceCheckout>>) {
  return crypto.createHash('sha256').update(JSON.stringify({
    userId,
    items: checkout.items,
    total: checkout.total,
    promoCodes: checkout.promoCodes,
  })).digest('hex');
}

async function razorpay(path: string, init?: RequestInit) {
  const { razorpayId, razorpaySecret } = config();
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${Buffer.from(`${razorpayId}:${razorpaySecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error(body?.error?.description || 'Razorpay request failed.'), { statusCode: response.status });
  }
  return body;
}

async function ensureOrderNotification(order: any, url: string, dbHeaders: Record<string, string>) {
  try {
    const lookup = new URL(`${url}/rest/v1/notifications`);
    lookup.searchParams.set('select', 'id');
    lookup.searchParams.set('type', 'eq.new_order');
    lookup.searchParams.set('metadata->>order_id', `eq.${order.id}`);
    lookup.searchParams.set('limit', '1');
    const existingResponse = await fetch(lookup, { headers: dbHeaders });
    const existing = existingResponse.ok ? await existingResponse.json() as Array<{ id: string }> : [];
    const message = `Order ${order.order_number || order.id} — ₹${order.total}`;
    if (existing[0]) {
      await fetch(`${url}/rest/v1/notifications?id=eq.${existing[0].id}`, {
        method: 'PATCH',
        headers: { ...dbHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'You received an order', message }),
      });
      return;
    }
    await fetch(`${url}/rest/v1/notifications`, {
      method: 'POST',
      headers: { ...dbHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'new_order',
        title: 'You received an order',
        message,
        metadata: { order_id: order.id, order_number: order.order_number || '', total: order.total },
      }),
    });
  } catch {
    // The paid order is already safely stored; notification delivery is retried by the dashboard polling flow.
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const user = await authenticate(req.headers.authorization);
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};
    if (![orderId, paymentId, signature].every((value) => typeof value === 'string' && value.length > 0)) {
      return res.status(400).json({ success: false, error: 'Missing payment details.' });
    }
    const expected = crypto.createHmac('sha256', config().razorpaySecret).update(`${orderId}|${paymentId}`).digest('hex');
    const supplied = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');
    if (supplied.length !== expectedBuffer.length || !crypto.timingSafeEqual(supplied, expectedBuffer)) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature.' });
    }

    const { url, serviceKey } = config();
    const dbHeaders = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };
    const existingUrl = new URL(`${url}/rest/v1/orders`);
    existingUrl.searchParams.set('select', '*');
    existingUrl.searchParams.set('payment_id', `eq.${paymentId}`);
    existingUrl.searchParams.set('limit', '1');
    const existingResponse = await fetch(existingUrl, { headers: dbHeaders });
    if (!existingResponse.ok) throw new Error('Could not check the saved order.');
    const existing = await existingResponse.json() as any[];
    if (existing[0]) {
      return res.status(200).json({
        success: true,
        data: { message: 'Order already saved', orderNumber: existing[0].order_number, order: existing[0] },
      });
    }

    const [providerOrder, providerPayment] = await Promise.all([
      razorpay(`/orders/${encodeURIComponent(orderId)}`),
      razorpay(`/payments/${encodeURIComponent(paymentId)}`),
    ]);
    const reservedPromos = parsePromoCodes(providerOrder.notes?.promo_codes || '');
    const submittedPromos = parsePromoCodes(req.body?.promoCodes ?? req.body?.promoCode);
    if (JSON.stringify(reservedPromos) !== JSON.stringify(submittedPromos)) {
      return res.status(400).json({ success: false, error: 'Offer codes do not match this payment order.' });
    }
    const checkout = await priceCheckout(req.body?.items, {
      url,
      serviceKey,
      userId: user.id,
      promoCodes: reservedPromos,
      honorReservedPromos: true,
    });
    const expectedAmount = Math.round(checkout.total * 100);
    if (
      providerPayment.order_id !== orderId
      || Number(providerPayment.amount) !== expectedAmount
      || Number(providerOrder.amount) !== expectedAmount
      || providerPayment.currency !== 'INR'
      || providerOrder.currency !== 'INR'
      || providerOrder.notes?.user_id !== user.id
      || providerOrder.notes?.checkout_hash !== checkoutHash(user.id, checkout)
    ) {
      return res.status(400).json({ success: false, error: 'Payment details do not match this checkout.' });
    }
    let paymentStatus = providerPayment.status;
    if (paymentStatus === 'authorized') {
      paymentStatus = (await razorpay(`/payments/${encodeURIComponent(paymentId)}/capture`, {
        method: 'POST',
        body: JSON.stringify({ amount: expectedAmount, currency: 'INR' }),
      })).status;
    }
    if (paymentStatus !== 'captured') {
      return res.status(409).json({ success: false, error: 'Payment has not been captured. Please contact support.' });
    }

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const orderNumber = `SLG-${Array.from({ length: 5 }, () => chars[crypto.randomInt(chars.length)]).join('')}`;
    const address = req.body?.shippingAddress && typeof req.body.shippingAddress === 'object' ? req.body.shippingAddress : null;
    const payload = {
      order_number: orderNumber,
      user_id: user.id,
      shipping_address: address ? {
        ...address,
        fullName: req.body?.customerName || user.user_metadata?.full_name || null,
        email: user.email || null,
        phone: req.body?.customerPhone || null,
        promoCodes: checkout.promoCodes,
        launchDiscount: checkout.launchDiscount,
        welcomeDiscount: checkout.welcomeDiscount,
        privateDiscount: checkout.privateDiscount,
      } : null,
      items: checkout.items,
      subtotal: checkout.subtotal,
      shipping_cost: checkout.shippingFee,
      total: checkout.total,
      status: 'Pending',
      payment_id: paymentId,
    };
    const insertResponse = await fetch(`${url}/rest/v1/orders?select=*`, {
      method: 'POST',
      headers: { ...dbHeaders, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(payload),
    });
    if (!insertResponse.ok) {
      throw new Error('Payment succeeded, but the order could not be saved. Please contact support with your payment ID.');
    }
    const inserted = await insertResponse.json() as any[];
    await ensureOrderNotification(inserted[0], url, dbHeaders);
    return res.status(200).json({
      success: true,
      data: { message: 'Payment verified and order saved', orderNumber, order: inserted[0] },
    });
  } catch (error: any) {
    return res.status(error?.statusCode || 500).json({
      success: false,
      error: error?.message || 'Could not verify payment.',
    });
  }
}
