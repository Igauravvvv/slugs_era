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
  return response.json() as Promise<{ id: string; email?: string; user_metadata?: Record<string, unknown> }>;
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
function hash(userId: string, checkout: any) { return crypto.createHash('sha256').update(JSON.stringify({ userId, items: checkout.items, total: checkout.total })).digest('hex'); }
async function razorpay(path: string, init?: RequestInit) {
  const { razorpayId, razorpaySecret } = config();
  const response = await fetch(`https://api.razorpay.com/v1${path}`, { ...init, headers: { Authorization: `Basic ${Buffer.from(`${razorpayId}:${razorpaySecret}`).toString('base64')}`, 'Content-Type': 'application/json', ...(init?.headers || {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(body?.error?.description || 'Razorpay request failed.'), { statusCode: response.status });
  return body;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const user = await authenticate(req.headers.authorization);
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};
    if (![orderId, paymentId, signature].every((value) => typeof value === 'string' && value.length > 0)) return res.status(400).json({ success: false, error: 'Missing payment details.' });
    const expected = crypto.createHmac('sha256', config().razorpaySecret).update(`${orderId}|${paymentId}`).digest('hex');
    const supplied = Buffer.from(signature, 'hex'); const expectedBuffer = Buffer.from(expected, 'hex');
    if (supplied.length !== expectedBuffer.length || !crypto.timingSafeEqual(supplied, expectedBuffer)) return res.status(400).json({ success: false, error: 'Invalid payment signature.' });

    const { url, serviceKey } = config();
    const dbHeaders = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };
    const existingUrl = new URL(`${url}/rest/v1/orders`); existingUrl.searchParams.set('select', '*'); existingUrl.searchParams.set('payment_id', `eq.${paymentId}`); existingUrl.searchParams.set('limit', '1');
    const existingResponse = await fetch(existingUrl, { headers: dbHeaders });
    if (!existingResponse.ok) throw new Error('Could not check the saved order.');
    const existing = await existingResponse.json() as any[];
    if (existing[0]) return res.status(200).json({ success: true, data: { message: 'Order already saved', orderNumber: existing[0].order_number, order: existing[0] } });

    const checkout = await priceItems(req.body?.items);
    const [providerOrder, providerPayment] = await Promise.all([razorpay(`/orders/${encodeURIComponent(orderId)}`), razorpay(`/payments/${encodeURIComponent(paymentId)}`)]);
    const expectedAmount = Math.round(checkout.total * 100);
    if (providerPayment.order_id !== orderId || Number(providerPayment.amount) !== expectedAmount || Number(providerOrder.amount) !== expectedAmount || providerPayment.currency !== 'INR' || providerOrder.currency !== 'INR' || providerOrder.notes?.user_id !== user.id || providerOrder.notes?.checkout_hash !== hash(user.id, checkout)) return res.status(400).json({ success: false, error: 'Payment details do not match this checkout.' });
    let paymentStatus = providerPayment.status;
    if (paymentStatus === 'authorized') paymentStatus = (await razorpay(`/payments/${encodeURIComponent(paymentId)}/capture`, { method: 'POST', body: JSON.stringify({ amount: expectedAmount, currency: 'INR' }) })).status;
    if (paymentStatus !== 'captured') return res.status(409).json({ success: false, error: 'Payment has not been captured. Please contact support.' });

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; const orderNumber = `SLG-${Array.from({ length: 5 }, () => chars[crypto.randomInt(chars.length)]).join('')}`;
    const address = req.body?.shippingAddress && typeof req.body.shippingAddress === 'object' ? req.body.shippingAddress : null;
    const payload = { order_number: orderNumber, user_id: user.id, shipping_address: address ? { ...address, fullName: req.body?.customerName || user.user_metadata?.full_name || null, email: user.email || null, phone: req.body?.customerPhone || null } : null, items: checkout.items, subtotal: checkout.subtotal, shipping_cost: checkout.shippingFee, total: checkout.total, status: 'Pending', payment_id: paymentId };
    const insertResponse = await fetch(`${url}/rest/v1/orders?select=*`, { method: 'POST', headers: { ...dbHeaders, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(payload) });
    if (!insertResponse.ok) throw new Error('Payment succeeded, but the order could not be saved. Please contact support with your payment ID.');
    const inserted = await insertResponse.json() as any[];
    return res.status(200).json({ success: true, data: { message: 'Payment verified and order saved', orderNumber, order: inserted[0] } });
  } catch (error: any) { return res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Could not verify payment.' }); }
}
