import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { amount, currency = 'INR' } = req.body;

    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ success: false, error: 'Amount is required and must be a number' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({ 
        success: false, 
        error: 'Razorpay keys are not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to Vercel Environment Variables.' 
      });
    }

    // Use Razorpay REST API directly (no SDK needed — avoids import crashes)
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt: `receipt_${Date.now()}`,
      }),
    });

    const order = await orderRes.json();

    if (!orderRes.ok) {
      console.error('Razorpay API error:', order);
      return res.status(500).json({ 
        success: false, 
        error: order.error?.description || 'Failed to create Razorpay order' 
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
}
