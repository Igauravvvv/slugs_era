import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import { supabaseAdmin } from '../lib/supabase';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const paymentRouter = express.Router();

// Instantiate later so we don't crash the server on boot if keys are missing

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Create Order endpoint
paymentRouter.post(
  '/create-order',
  [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('currency').optional().isString(),
    body('receipt').optional().isString()
  ],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { amount, currency = 'INR', receipt } = req.body;

    // amount should be smallest unit (e.g. paise for INR). 
    // Razorpay requires amount in integer.
    const options = {
      amount: amount * 100, // converting to paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, error: 'Razorpay keys are missing from Vercel Environment Variables.' });
    }

    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await rzp.orders.create(options);
    
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
});

// Generate a human-readable order number: SLG-XXXXX
function generateOrderNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I)
  let result = 'SLG-';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Verify signature endpoint
paymentRouter.post(
  '/verify',
  [
    body('razorpay_order_id').isString().notEmpty(),
    body('razorpay_payment_id').isString().notEmpty(),
    body('razorpay_signature').isString().notEmpty(),
    body('userId').isString().notEmpty(),
    body('items').isArray().notEmpty(),
    body('totalAmount').isNumeric().notEmpty()
  ],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

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

    const secret = process.env.RAZORPAY_KEY_SECRET || '';

    // Signature verification logic provided by Razorpay
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature',
      });
    }

    const orderNumber = generateOrderNumber();
    const subtotal = totalAmount - (shippingFee || 0);

    // Payment is valid, save order to Supabase with service role
    const { data: orderData, error: dbError } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          order_number: orderNumber,
          user_id: userId,
          email: customerEmail || null,
          customer_name: customerName || null,
          customer_email: customerEmail || null,
          customer_phone: customerPhone || null,
          shipping_address: shippingAddress || null,
          items: items,
          subtotal: subtotal,
          shipping_fee: shippingFee || 0,
          total: totalAmount,
          payment_method: 'Razorpay',
          payment_status: 'Paid',
          status: 'Pending',
          payment_id: razorpay_payment_id
        }
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    // Send confirmation email
    const emailTo = customerEmail || null;
    if (!emailTo) {
      // Fallback: try fetching from users table
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('email, name')
        .eq('id', userId)
        .single();
      if (userData?.email) {
        try {
          await transporter.sendMail({
            from: `"Slug's Era" <${process.env.SMTP_USER}>`,
            to: userData.email,
            subject: `Order Confirmed — ${orderNumber}`,
            text: `Thank you for your order, ${userData.name || 'there'}!\n\nOrder Number: ${orderNumber}\nPayment ID: ${razorpay_payment_id}\nTotal: ₹${totalAmount}\n\nWe'll notify you when your order ships.`,
          });
        } catch (emailErr) {
          console.warn('Failed to send confirmation email:', emailErr);
        }
      }
    } else {
      try {
        await transporter.sendMail({
          from: `"Slug's Era" <${process.env.SMTP_USER}>`,
          to: emailTo,
          subject: `Order Confirmed — ${orderNumber}`,
          text: `Thank you for your order, ${customerName || 'there'}!\n\nOrder Number: ${orderNumber}\nPayment ID: ${razorpay_payment_id}\nTotal: ₹${totalAmount}\n\nWe'll notify you when your order ships.`,
        });
      } catch (emailErr) {
        console.warn('Failed to send confirmation email:', emailErr);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'Payment verified and order saved',
        orderNumber,
        order: orderData
      }
    });

  } catch (error) {
    next(error);
  }
});
