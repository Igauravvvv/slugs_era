import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { globalLimiter, strictLimiter } from './middleware/security';
import { errorHandler } from './middleware/errorHandler';

// Route Imports
import { paymentRouter } from './routes/payment';
import { adminRouter } from './routes/admin';
// import { authRouter } from './routes/auth'; // Not strictly needed entirely as Supabase handles auth natively in frontend, but could be added

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 1. SECURITY & MIDDLEWARE
// ==========================================

// Helmet for setting secure HTTP headers
app.use(helmet());

// Global Rate Limiting
app.use(globalLimiter);

// Parse JSON Bodies
app.use(express.json());

// CORS config
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));

// ==========================================
// 2. ROUTES
// ==========================================
app.get('/health', (req, res) => res.json({ success: true, message: 'Server is healthy' }));

// Payment Routes (Stricter Rate Limit)
app.use('/api/payment', strictLimiter, paymentRouter);

// Admin Routes (Could add auth middleware here later)
app.use('/api/admin', adminRouter);

// Fallback legacy subscribe route (Updated for consistency)
import nodemailer from 'nodemailer';
import emailTemplate from './template';
import { supabaseAdmin } from './lib/supabase';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // use STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

app.post('/api/subscribe', strictLimiter, async (req, res, next) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'A valid email is required' });
  }

  try {
    // 1. Save subscriber to Supabase (upsert to handle duplicates gracefully)
    const { data: existing } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id, is_active')
      .eq('email', email.toLowerCase())
      .single();

    if (existing && existing.is_active) {
      return res.status(409).json({ success: false, message: 'You are already subscribed!' });
    }

    if (existing && !existing.is_active) {
      // Re-activate a previously unsubscribed user
      await supabaseAdmin
        .from('newsletter_subscribers')
        .update({ is_active: true, subscribed_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      // New subscriber
      const { error: insertError } = await supabaseAdmin
        .from('newsletter_subscribers')
        .insert({ email: email.toLowerCase() });

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        return res.status(500).json({ success: false, message: 'Failed to save subscription' });
      }
    }

    // 2. Send welcome email
    if (process.env.SMTP_USER && process.env.SMTP_PASS && !process.env.SMTP_PASS.includes('YOUR_')) {
      await transporter.sendMail({
        from: `"Slugs Era" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Welcome to The Slow Club 🐌',
        html: emailTemplate
      });
    } else {
      console.warn('SMTP not configured — skipping welcome email for:', email);
    }

    res.status(200).json({ success: true, message: 'Welcome to The Slow Club!' });
  } catch (error) {
    console.error('Subscribe error:', error);
    next(error);
  }
});

// ==========================================
// 3. ERROR HANDLER
// ==========================================
app.use(errorHandler);

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`CORS allowed origin: ${allowedOrigin}`);
});
