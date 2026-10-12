import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendOrderEmail } from '../_lib/order-email.js';
import { adminConfig, adminDbHeaders, requireSignedInAdmin } from '../_lib/admin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const user = await requireSignedInAdmin(req);
    const admin = ['slugsera@gmail.com', 'igauravvvv@gmail.com'].includes(String(user.email).toLowerCase());
    if (req.method === 'POST') {
      const orderId = req.body?.orderId;
      if (typeof orderId !== 'string' || !/^[a-f0-9-]{36}$/i.test(orderId)) return res.status(400).json({error:'Invalid order ID'});
      const {url} = adminConfig();
      const lookup = new URL(`${url}/rest/v1/orders`);
      lookup.searchParams.set('id', `eq.${orderId}`); lookup.searchParams.set('select','*');
      if (!admin) lookup.searchParams.set('user_id', `eq.${user?.id}`);
      const response = await fetch(lookup, {headers:adminDbHeaders()});
      if (!response.ok) throw new Error('Could not read order');
      const [order] = await response.json();
      if (!order) return res.status(404).json({error:'Order not found'});
      return res.status(200).json({success:true,delivery:await sendOrderEmail(order)});
    }
    if (req.method !== 'GET') return res.status(405).json({error:'Method not allowed'});
    if (!admin) return res.status(403).json({error:'Forbidden'});
    const {url} = adminConfig();
    const target = new URL(`${url}/rest/v1/orders`);
    target.searchParams.set('select','id,order_number,created_at,total,payment_id,shipping_address');
    target.searchParams.set('order','created_at.desc'); target.searchParams.set('limit','10');
    target.searchParams.set('shipping_address->>email','eq.slugsera@gmail.com');
    const response = await fetch(target,{headers:adminDbHeaders()});
    if(!response.ok) throw new Error('Could not read orders');
    const orders=await response.json();
    return res.status(200).json({orders:orders.map((o:any)=>({id:o.id,orderNumber:o.order_number,createdAt:o.created_at,total:o.total,paymentMethod:o.shipping_address?.paymentMethod || (o.payment_id?'Razorpay':'unknown'),email:o.shipping_address?.email,emailDelivery:o.shipping_address?.emailDelivery})),smtpUser:process.env.SMTP_USER || 'slugsera@gmail.com',recipient:process.env.ORDER_NOTIFICATION_EMAIL || 'slugsera@gmail.com'});
  } catch(error:any){return res.status(error.statusCode || 500).json({error:error.message});}
}
