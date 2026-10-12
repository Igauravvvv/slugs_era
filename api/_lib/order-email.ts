import crypto from 'node:crypto';
type Delivery = { sentAt?: string; error?: string };
type DeliveryState = { attemptId?: string; leaseUntil?: number; store?: Delivery; customer?: Delivery };
export type EmailOrder = {
  id: string; order_number?: string; total: number; payment_id?: string | null;
  shipping_address?: { fullName?: string; phone?: string; email?: string; street?: string; city?: string; state?: string; pincode?: string; paymentMethod?: string; emailDelivery?: DeliveryState } | null;
  items?: Array<{ name?: string; quantity?: number; qty?: number; size?: string; color?: string; price?: number }>;
};

export function orderEmail(order: EmailOrder) {
  const address = order.shipping_address || {};
  const cod = address.paymentMethod === 'COD';
  const orderNumber = order.order_number || order.id;
  return {
    subject: `New ${cod ? 'COD ' : ''}order received — ${orderNumber.replace(/[\r\n]/g, '')}`,
    text: [
      'You have received a new Slugsera order!', '',
      `Order number: ${orderNumber}`, `Order ID: ${order.id}`,
      `Payment: ${cod ? 'Cash on delivery — payment pending' : 'Razorpay — paid'}`,
      `${cod ? 'Collect on delivery' : 'Total paid'}: INR ${Number(order.total).toFixed(2)}`, '',
      'Items:', ...(order.items || []).map(item => `${item.name || 'Product'} × ${item.quantity ?? item.qty ?? 1}${item.size ? ` / ${item.size}` : ''}${item.color ? ` / ${item.color}` : ''}`), '',
      'Deliver to:', address.fullName, address.phone, address.email,
      address.street, [address.city, address.state, address.pincode].filter(Boolean).join(', '), '',
      'Manage this order: https://www.slugsera.com/dashboard/orders',
    ].filter(line => line !== undefined).join('\n'),
  };
}

export function customerOrderEmail(order: EmailOrder) {
  const cod = order.shipping_address?.paymentMethod === 'COD';
  const number = order.order_number || order.id;
  return {
    subject: `Your Slugsera order is confirmed — ${number.replace(/[\r\n]/g, '')}`,
    text: [
      `Thank you${order.shipping_address?.fullName ? `, ${order.shipping_address.fullName}` : ''}!`,
      'Your order is confirmed. We are getting it ready for you.', '',
      `Order number: ${number}`, `Order ID: ${order.id}`,
      `${cod ? 'Amount due on delivery' : 'Amount paid'}: INR ${Number(order.total).toFixed(2)}`,
      cod ? 'Payment method: Cash on delivery. Please pay when your parcel arrives.' : 'Your online payment has been received.', '',
      'Your items:', ...(order.items || []).map(item => `${item.name || 'Product'} × ${item.quantity ?? item.qty ?? 1}${item.size ? ` / ${item.size}` : ''}`), '',
      'Track your order: https://www.slugsera.com/profile',
      'Questions? Reply to this email and we will help.',
      'Slugsera — Movement, not merch.',
    ].join('\n'),
  };
}

export type EmailResult = { store: boolean; customer: boolean; pending?: boolean };

/** Persist each recipient's result; atomically claim delivery so retries cannot send twice. */
export async function sendOrderEmail(input: EmailOrder): Promise<EmailResult> {
  const fallback = { store: false, customer: false, pending: true };
  try {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Database configuration missing');
    const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };
    const endpoint = `${url}/rest/v1/orders?id=eq.${encodeURIComponent(input.id)}`;
    const read = await fetch(`${endpoint}&select=*`, { headers });
    if (!read.ok) throw new Error('Could not read order email status');
    const order = (await read.json() as EmailOrder[])[0];
    if (!order) throw new Error('Order not found');
    const address = order.shipping_address || {};
    const previous = address.emailDelivery || {};
    const status = () => ({ store: Boolean(previous.store?.sentAt), customer: Boolean(previous.customer?.sentAt) });
    if (previous.store?.sentAt && previous.customer?.sentAt) return status();
    if (previous.leaseUntil && previous.leaseUntil > Date.now()) return { ...status(), pending: true };
    const attemptId = crypto.randomUUID();
    const state: DeliveryState = { ...previous, attemptId, leaseUntil: Date.now() + 90_000 };
    const claim = new URL(endpoint);
    claim.searchParams.set('shipping_address->emailDelivery->>attemptId', previous.attemptId ? `eq.${previous.attemptId}` : 'is.null');
    const claimed = await fetch(claim, { method: 'PATCH', headers, body: JSON.stringify({ shipping_address: { ...address, emailDelivery: state } }) });
    if (!claimed.ok) throw new Error('Could not claim order email delivery');
    if (!(await claimed.json()).length) return { ...status(), pending: true };
    const user = process.env.SMTP_USER || 'slugsera@gmail.com';
    const { default: nodemailer } = await import('nodemailer');
    const port = Number(process.env.SMTP_PORT || 587);
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com', port, secure: port === 465,
      auth: { user, pass: process.env.SMTP_PASS },
      connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 8000,
    });
    await Promise.all((['store', 'customer'] as const).map(async recipient => {
      if (state[recipient]?.sentAt) return;
      const to = recipient === 'store' ? process.env.ORDER_NOTIFICATION_EMAIL || 'slugsera@gmail.com' : address.email;
      try {
        if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw Object.assign(new Error('Missing recipient'), { code: 'MISSING_EMAIL' });
        const result = await transport.sendMail({
          from: { name: 'Slugsera Orders', address: user }, to, replyTo: 'slugsera@gmail.com',
          messageId: `<${recipient}-order-${order.id}@slugsera.com>`,
          ...(recipient === 'store' ? orderEmail(order) : customerOrderEmail(order)),
        });
        if (!result.accepted?.length) throw Object.assign(new Error('Message rejected'), { code: 'REJECTED' });
        state[recipient] = { sentAt: new Date().toISOString() };
        console.info('[order-email] Accepted', { orderId: order.id, recipient, messageId: result.messageId });
      } catch (error) {
        state[recipient] = { error: (error as { code?: string }).code || 'EMAIL_FAILED' };
        console.error('[order-email] Failed', { orderId: order.id, recipient, code: state[recipient]?.error });
      }
    }));
    transport.close();
    state.leaseUntil = 0;
    const finish = new URL(endpoint);
    finish.searchParams.set('shipping_address->emailDelivery->>attemptId', `eq.${attemptId}`);
    const saved = await fetch(finish, { method: 'PATCH', headers, body: JSON.stringify({ shipping_address: { ...address, emailDelivery: state } }) });
    if (!saved.ok) throw new Error('Could not persist email delivery status');
    return { store: Boolean(state.store?.sentAt), customer: Boolean(state.customer?.sentAt) };
  } catch (error) {
    console.error('[order-email] Delivery deferred', { orderId: input.id, code: (error as { code?: string }).code || 'DELIVERY_STATE_FAILED' });
    return fallback;
  }
}
