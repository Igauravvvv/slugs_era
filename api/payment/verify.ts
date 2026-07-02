import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      userId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      totalAmount,
      shippingFee
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing payment details' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, error: 'Razorpay key secret not configured' });
    }

    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }

    // Generate order number
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let orderNumber = 'SLG-';
    for (let i = 0; i < 5; i++) {
      orderNumber += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Save to Supabase if configured
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    let orderData = null;

    if (supabaseUrl && supabaseKey) {
      const subtotal = totalAmount - (shippingFee || 0);

      const insertRes = await fetch(`${supabaseUrl}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          order_number: orderNumber,
          user_id: userId || null,
          customer_name: customerName || null,
          customer_email: customerEmail || null,
          customer_phone: customerPhone || null,
          shipping_address: shippingAddress || null,
          items: items || [],
          subtotal: subtotal,
          shipping_fee: shippingFee || 0,
          total: totalAmount,
          payment_method: 'Razorpay',
          payment_status: 'Paid',
          status: 'Pending',
          payment_id: razorpay_payment_id,
        }),
      });

      if (insertRes.ok) {
        const insertData = await insertRes.json();
        orderData = Array.isArray(insertData) ? insertData[0] : insertData;
      } else {
        console.error('Supabase insert error:', await insertRes.text());
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        message: 'Payment verified and order saved',
        orderNumber,
        order: orderData,
      }
    });
  } catch (error: any) {
    console.error('Verify error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
}
