import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import { supabaseAdmin } from '../lib/supabase';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const paymentRouter = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

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

    const order = await razorpay.orders.create(options);
    
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
});

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
      items,
      totalAmount
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

    // Payment is valid, save order carefully to Supabase with service role
    const { data: orderData, error: dbError } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          user_id: userId,
          items: items,
          total: totalAmount,
          status: 'paid',
          payment_id: razorpay_payment_id
        }
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    // Wait, fetch user email for confirmation email
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (userData && userData.email) {
      await transporter.sendMail({
        from: `"Slug's Era" <${process.env.SMTP_USER}>`,
        to: userData.email,
        subject: "Order Confirmation - Slug's Era",
        text: `Thank you for your order! Payment ID: ${razorpay_payment_id}. Your total was ₹${totalAmount}.`,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'Payment verified and order saved',
        order: orderData
      }
    });

  } catch (error) {
    next(error);
  }
});
