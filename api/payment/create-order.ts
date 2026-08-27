import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

function config() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey || !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) throw Object.assign(new Error('Checkout is not configured.'), { statusCode: 500 });
  return { url, anonKey, serviceKey, razorpayId: process.env.RAZORPAY_KEY_ID, razorpaySecret: process.env.RAZORPAY_KEY_SECRET };
}

async function authenticate(header: string | string[] | undefined) {
  const token = typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) throw Object.assign(new Error('Please sign in before checking out.'), { statusCode: 401 });
  const { url, anonKey } = config();
  const response = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anonKey, Authorization: `Bearer ${token}` } });
  if (!response.ok) throw Object.assign(new Error('Your session expired. Please sign in again.'), { statusCode: 401 });
  return response.json() as Promise<{ id: string }>;
}

async function priceItems(raw: unknown) {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > 50) throw Object.assign(new Error('Your cart must contain between 1 and 50 items.'), { statusCode: 400 });
  const requested = raw.map((item: any) => ({ productId: typeof item?.productId === 'string' ? item.productId : '', size: typeof item?.size === 'string' ? item.size.slice(0, 30) : undefined, color: typeof item?.color === 'string' ? item.color.slice(0, 50) : undefined, quantity: Number(item?.quantity) }));
  if (requested.some((item) => !/^[a-zA-Z0-9_-]{1,100}$/.test(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10)) throw Object.assign(new Error('Your cart contains an invalid product or quantity.'), { statusCode: 400 });
  const ids = [...new Set(requested.map((item) => item.productId))];
  const { url, serviceKey } = config();
  const productsUrl = new URL(`${url}/rest/v1/products`); productsUrl.searchParams.set('select', 'id,name,price,is_published,stock_quantity'); productsUrl.searchParams.set('id', `in.(${ids.join(',')})`);
  const response = await fetch(productsUrl, { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } });
  if (!response.ok) throw new Error('Could not validate your cart.');
  const products = await response.json() as any[];
  if (products.length !== ids.length) throw Object.assign(new Error('One or more products are no longer available.'), { statusCode: 409 });
  const byId = new Map(products.map((product) => [product.id, product]));
  const quantities = new Map<string, number>(); requested.forEach((item) => quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity));
  const items = requested.map((item) => { const product = byId.get(item.productId); if (product.is_published === false || (typeof product.stock_quantity === 'number' && product.stock_quantity < (quantities.get(item.productId) || 0))) throw Object.assign(new Error(`${product.name} is unavailable in that quantity.`), { statusCode: 409 }); return { ...item, name: product.name, price: Number(product.price) }; });
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { items, subtotal, shippingFee: 0, total: subtotal };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const user = await authenticate(req.headers.authorization);
    const checkout = await priceItems(req.body?.items);
    const { razorpayId, razorpaySecret } = config();
    const checkoutHash = crypto.createHash('sha256').update(JSON.stringify({ userId: user.id, items: checkout.items, total: checkout.total })).digest('hex');
    const response = await fetch('https://api.razorpay.com/v1/orders', { method: 'POST', headers: { Authorization: `Basic ${Buffer.from(`${razorpayId}:${razorpaySecret}`).toString('base64')}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: Math.round(checkout.total * 100), currency: 'INR', receipt: `checkout_${Date.now()}`, notes: { user_id: user.id, checkout_hash: checkoutHash } }) });
    const order = await response.json();
    if (!response.ok) throw Object.assign(new Error(order?.error?.description || 'Razorpay order failed.'), { statusCode: response.status });
    return res.status(200).json({ success: true, data: order, checkout: { subtotal: checkout.subtotal, shippingFee: checkout.shippingFee, total: checkout.total } });
  } catch (error: any) { return res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Could not create payment order.' }); }
}
