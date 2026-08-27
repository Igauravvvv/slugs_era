import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticate, checkoutHash, orderNumber, priceCheckoutItems, razorpayRequest, supabaseConfig, verifySignature } from '../../server/lib/paymentCheckout.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const user = await authenticate(req.headers.authorization);
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};
    if (![orderId, paymentId, signature].every((value) => typeof value === 'string' && value.length > 0)) return res.status(400).json({ success: false, error: 'Missing payment details.' });
    if (!verifySignature(orderId, paymentId, signature)) return res.status(400).json({ success: false, error: 'Invalid payment signature.' });

    const { url, serviceKey } = supabaseConfig();
    const existingUrl = new URL(`${url}/rest/v1/orders`);
    existingUrl.searchParams.set('select', '*');
    existingUrl.searchParams.set('payment_id', `eq.${paymentId}`);
    existingUrl.searchParams.set('limit', '1');
    const dbHeaders = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };
    const existingResponse = await fetch(existingUrl, { headers: dbHeaders });
    if (!existingResponse.ok) throw new Error('Could not check the saved order.');
    const existing = await existingResponse.json() as any[];
    if (existing[0]) return res.status(200).json({ success: true, data: { message: 'Order already saved', orderNumber: existing[0].order_number, order: existing[0] } });

    const checkout = await priceCheckoutItems(req.body?.items);
    const [providerOrder, providerPayment] = await Promise.all([razorpayRequest(`/orders/${encodeURIComponent(orderId)}`), razorpayRequest(`/payments/${encodeURIComponent(paymentId)}`)]);
    const expectedAmount = Math.round(checkout.total * 100);
    if (providerPayment.order_id !== orderId || Number(providerPayment.amount) !== expectedAmount || Number(providerOrder.amount) !== expectedAmount || providerPayment.currency !== 'INR' || providerOrder.currency !== 'INR' || providerOrder.notes?.user_id !== user.id || providerOrder.notes?.checkout_hash !== checkoutHash(user.id, checkout)) return res.status(400).json({ success: false, error: 'Payment details do not match this checkout.' });

    let paymentStatus = providerPayment.status;
    if (paymentStatus === 'authorized') {
      const captured = await razorpayRequest(`/payments/${encodeURIComponent(paymentId)}/capture`, { method: 'POST', body: JSON.stringify({ amount: expectedAmount, currency: 'INR' }) });
      paymentStatus = captured.status;
    }
    if (paymentStatus !== 'captured') return res.status(409).json({ success: false, error: 'Payment has not been captured. Please contact support.' });

    const number = orderNumber();
    const address = req.body?.shippingAddress && typeof req.body.shippingAddress === 'object' ? req.body.shippingAddress : null;
    const payload = {
      order_number: number,
      user_id: user.id,
      shipping_address: address ? { ...address, fullName: req.body?.customerName || user.user_metadata?.full_name || null, email: user.email || null, phone: req.body?.customerPhone || null } : null,
      items: checkout.items,
      subtotal: checkout.subtotal,
      shipping_cost: checkout.shippingFee,
      total: checkout.total,
      status: 'Pending',
      payment_id: paymentId,
    };
    const insertResponse = await fetch(`${url}/rest/v1/orders?select=*`, { method: 'POST', headers: { ...dbHeaders, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(payload) });
    if (!insertResponse.ok) throw new Error('Payment succeeded, but the order could not be saved. Please contact support with your payment ID.');
    const inserted = await insertResponse.json() as any[];
    return res.status(200).json({ success: true, data: { message: 'Payment verified and order saved', orderNumber: number, order: inserted[0] } });
  } catch (error: any) {
    return res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Could not verify payment.' });
  }
}
