export type EmailOrder = {
  id: string; order_number?: string; total: number; payment_id?: string | null;
  shipping_address?: { fullName?: string; phone?: string; email?: string; street?: string; city?: string; state?: string; pincode?: string; paymentMethod?: string } | null;
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

/** Email failure must never turn a successfully saved order into a checkout failure. */
export async function sendOrderEmail(order: EmailOrder): Promise<boolean> {
  try {
    const user = process.env.SMTP_USER || 'slugsera@gmail.com';
    if (!process.env.SMTP_PASS) throw new Error('SMTP_PASS is missing');
    const { default: nodemailer } = await import('nodemailer');
    const port = Number(process.env.SMTP_PORT || 587);
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com', port, secure: port === 465,
      auth: { user, pass: process.env.SMTP_PASS },
      connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 8000,
    });
    const result = await transport.sendMail({
      from: { name: 'Slugsera Orders', address: user },
      to: process.env.ORDER_NOTIFICATION_EMAIL || 'slugsera@gmail.com',
      messageId: `<order-${order.id}@slugsera.com>`,
      ...orderEmail(order),
    });
    if (!result.accepted?.length) throw new Error('Mail server did not accept the message');
    return true;
  } catch (error) {
    console.error('[order-email] Delivery failed', { orderId: order.id, code: (error as { code?: string }).code || 'EMAIL_FAILED' });
    return false;
  }
}
