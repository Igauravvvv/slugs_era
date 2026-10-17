import crypto from 'node:crypto';
import { retryOrderEmails } from './_lib/retry-order-emails.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const expected = process.env.CRON_SECRET ? Buffer.from(`Bearer ${process.env.CRON_SECRET}`) : null;
  const actual = Buffer.from(req.headers.authorization || '');
  if (!expected || expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return res.status(401).json({ error: 'Unauthorized' });
  try {
    // Authenticated operational diagnostics; never returns customer contact details.
    if (req.query?.orderId) {
      const orderId = String(req.query.orderId);
      if (!/^[a-f0-9-]{36}$/i.test(orderId)) return res.status(400).json({error:'Invalid order ID'});
      const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const response = await fetch(`${url}/rest/v1/orders?id=eq.${orderId}&select=id,order_number,created_at,shipping_address`, {headers:{apikey:key,Authorization:`Bearer ${key}`}});
      if (!response.ok) throw new Error('Order lookup failed');
      const [order] = await response.json();
      if (!order) return res.status(404).json({error:'Order not found'});
      return res.status(200).json({id:order.id,orderNumber:order.order_number,createdAt:order.created_at,sender:process.env.SMTP_USER || 'slugsera@gmail.com',storeRecipient:process.env.ORDER_NOTIFICATION_EMAIL || 'slugsera@gmail.com',delivery:order.shipping_address?.emailDelivery});
    }
    // The orders query also keeps the database active, as the original cron did.
    const result = await retryOrderEmails();
    console.info('[order-email] Scheduled retry', result);
    return res.status(200).json({ success: true, ...result });
  } catch {
    console.error('[order-email] Scheduled retry failed');
    return res.status(500).json({ error: 'Email retry failed' });
  }
}
