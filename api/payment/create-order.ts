import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticate, checkoutHash, priceCheckoutItems, razorpayRequest } from '../../server/lib/paymentCheckout.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const user = await authenticate(req.headers.authorization);
    const checkout = await priceCheckoutItems(req.body?.items);
    const order = await razorpayRequest('/orders', {
      method: 'POST',
      body: JSON.stringify({
        amount: Math.round(checkout.total * 100),
        currency: 'INR',
        receipt: `checkout_${Date.now()}`,
        notes: { user_id: user.id, checkout_hash: checkoutHash(user.id, checkout) },
      }),
    });
    return res.status(200).json({ success: true, data: order, checkout: { subtotal: checkout.subtotal, shippingFee: checkout.shippingFee, total: checkout.total } });
  } catch (error: any) {
    return res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Could not create payment order.' });
  }
}
