import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { priceCheckout } from '../_lib/checkout.js';

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
  return response.json() as Promise<{ id: string }>;
}

function checkoutHash(userId: string, checkout: Awaited<ReturnType<typeof priceCheckout>>) {
  return crypto.createHash('sha256').update(JSON.stringify({
    userId,
    items: checkout.items,
    total: checkout.total,
    promoCodes: checkout.promoCodes,
  })).digest('hex');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const user = await authenticate(req.headers.authorization);
    const { url, serviceKey, razorpayId, razorpaySecret } = config();
    const checkout = await priceCheckout(req.body?.items, {
      url,
      serviceKey,
      userId: user.id,
      promoCodes: req.body?.promoCodes ?? req.body?.promoCode,
    });
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${razorpayId}:${razorpaySecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(checkout.total * 100),
        currency: 'INR',
        receipt: `checkout_${Date.now()}`,
        notes: {
          user_id: user.id,
          checkout_hash: checkoutHash(user.id, checkout),
          promo_codes: checkout.promoCodes.join(','),
        },
      }),
    });
    const order = await response.json();
    if (!response.ok) {
      throw Object.assign(new Error(order?.error?.description || 'Razorpay order failed.'), { statusCode: response.status });
    }
    return res.status(200).json({
      success: true,
      data: order,
      checkout: {
        retailSubtotal: checkout.retailSubtotal,
        launchDiscount: checkout.launchDiscount,
        welcomeDiscount: checkout.welcomeDiscount,
        privateDiscount: checkout.privateDiscount,
        subtotal: checkout.subtotal,
        shippingFee: checkout.shippingFee,
        total: checkout.total,
        promoCodes: checkout.promoCodes,
      },
    });
  } catch (error: any) {
    return res.status(error?.statusCode || 500).json({
      success: false,
      error: error?.message || 'Could not create payment order.',
    });
  }
}
