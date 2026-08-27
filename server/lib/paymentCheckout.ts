import crypto from 'crypto';

export type CheckoutItem = { productId: string; name: string; size?: string; color?: string; quantity: number; price: number };
export type Checkout = { items: CheckoutItem[]; subtotal: number; shippingFee: number; total: number };
export type AuthUser = { id: string; email?: string; user_metadata?: Record<string, unknown> };

function env(name: string, fallback?: string): string {
  const value = process.env[name] || (fallback ? process.env[fallback] : undefined);
  if (!value) throw Object.assign(new Error(`${name} is not configured.`), { statusCode: 500 });
  return value;
}

export function supabaseConfig() {
  return {
    url: env('SUPABASE_URL', 'VITE_SUPABASE_URL'),
    anonKey: env('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY'),
    serviceKey: env('SUPABASE_SERVICE_ROLE_KEY'),
  };
}

export async function authenticate(authorization: string | string[] | undefined): Promise<AuthUser> {
  const token = typeof authorization === 'string' && authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) throw Object.assign(new Error('Please sign in before checking out.'), { statusCode: 401 });
  const { url, anonKey } = supabaseConfig();
  const response = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anonKey, Authorization: `Bearer ${token}` } });
  if (!response.ok) throw Object.assign(new Error('Your session expired. Please sign in again.'), { statusCode: 401 });
  return response.json() as Promise<AuthUser>;
}

export async function priceCheckoutItems(rawItems: unknown): Promise<Checkout> {
  if (!Array.isArray(rawItems) || rawItems.length < 1 || rawItems.length > 50) throw Object.assign(new Error('Your cart must contain between 1 and 50 items.'), { statusCode: 400 });
  const requested = rawItems.map((raw: any) => ({
    productId: typeof raw?.productId === 'string' ? raw.productId : '',
    size: typeof raw?.size === 'string' ? raw.size.slice(0, 30) : undefined,
    color: typeof raw?.color === 'string' ? raw.color.slice(0, 50) : undefined,
    quantity: Number(raw?.quantity),
  }));
  if (requested.some((item) => !/^[a-zA-Z0-9_-]{1,100}$/.test(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10)) throw Object.assign(new Error('Your cart contains an invalid product or quantity.'), { statusCode: 400 });

  const ids = [...new Set(requested.map((item) => item.productId))];
  const { url, serviceKey } = supabaseConfig();
  const productsUrl = new URL(`${url}/rest/v1/products`);
  productsUrl.searchParams.set('select', 'id,name,price,is_published,stock_quantity');
  productsUrl.searchParams.set('id', `in.(${ids.join(',')})`);
  const response = await fetch(productsUrl, { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } });
  if (!response.ok) throw new Error('Could not validate the products in your cart.');
  const products = await response.json() as Array<{ id: string; name: string; price: number; is_published?: boolean; stock_quantity?: number }>;
  if (products.length !== ids.length) throw Object.assign(new Error('One or more products are no longer available.'), { statusCode: 409 });
  const byId = new Map(products.map((product) => [product.id, product]));
  const quantities = new Map<string, number>();
  requested.forEach((item) => quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity));
  const items = requested.map((item) => {
    const product = byId.get(item.productId)!;
    if (product.is_published === false) throw Object.assign(new Error(`${product.name} is no longer available.`), { statusCode: 409 });
    if (typeof product.stock_quantity === 'number' && product.stock_quantity < (quantities.get(item.productId) || 0)) throw Object.assign(new Error(`Only ${product.stock_quantity} unit(s) of ${product.name} are available.`), { statusCode: 409 });
    return { ...item, name: product.name, price: Number(product.price) };
  });
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { items, subtotal, shippingFee: 0, total: subtotal };
}

export function checkoutHash(userId: string, checkout: Checkout): string {
  return crypto.createHash('sha256').update(JSON.stringify({ userId, items: checkout.items, total: checkout.total })).digest('hex');
}

export async function razorpayRequest(path: string, init?: RequestInit): Promise<any> {
  const id = env('RAZORPAY_KEY_ID');
  const secret = env('RAZORPAY_KEY_SECRET');
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`, 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(body?.error?.description || 'Razorpay request failed.'), { statusCode: response.status });
  return body;
}

export function verifySignature(orderId: string, paymentId: string, signature: string): boolean {
  const expected = crypto.createHmac('sha256', env('RAZORPAY_KEY_SECRET')).update(`${orderId}|${paymentId}`).digest('hex');
  const supplied = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  return supplied.length === expectedBuffer.length && crypto.timingSafeEqual(supplied, expectedBuffer);
}

export function orderNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return `SLG-${Array.from({ length: 5 }, () => chars[crypto.randomInt(chars.length)]).join('')}`;
}
