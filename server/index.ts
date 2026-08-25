import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { globalLimiter, strictLimiter } from './middleware/security';
import { errorHandler } from './middleware/errorHandler';

// Route Imports
import { paymentRouter } from './routes/payment';
import { adminRouter } from './routes/admin';
import { supabaseAdmin } from './lib/supabase';
import nodemailer from 'nodemailer';
import emailTemplate from './template';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust Vercel's proxy for accurate rate limiting (req.ip)
app.set('trust proxy', 1);

// ==========================================
// 1. SECURITY & MIDDLEWARE
// ==========================================

// Helmet for setting secure HTTP headers
app.use(helmet());

// Global Rate Limiting
app.use(globalLimiter);

// Parse JSON Bodies (Vercel automatically parses body, so we skip it to prevent hanging)
if (!process.env.VERCEL) {
  app.use(express.json());
} else {
  // If Vercel parsed it but didn't set it to an object for some reason, ensure it's safe
  app.use((req, res, next) => {
    if (req.body && typeof req.body === 'string') {
      try { req.body = JSON.parse(req.body); } catch { req.body = {}; }
    }
    next();
  });
}

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

// Keep-Alive route to prevent Supabase from pausing
app.get('/api/keep-alive', async (req, res) => {
  try {
    // A lightweight query to keep the Supabase database awake
    const { error } = await supabaseAdmin.from('products').select('id').limit(1);
    if (error) throw error;
    res.json({ success: true, message: 'Supabase is awake and active!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to ping Supabase', error: error.message });
  }
});

// Payment Routes (Stricter Rate Limit)
app.use('/api/payment', strictLimiter, paymentRouter);

// Admin Routes (Could add auth middleware here later)
// Admin Routes (Could add auth middleware here later)
app.use('/api/admin', adminRouter);

// Fallback legacy subscribe route (Updated for consistency)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // use STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
}[character] || character));

app.post('/api/contact', strictLimiter, async (req, res, next) => {
  const { name, email, subject, message } = req.body || {};
  if (
    typeof name !== 'string' || !name.trim() || name.length > 100 ||
    typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof subject !== 'string' || !subject.trim() || subject.length > 150 ||
    typeof message !== 'string' || message.trim().length < 10 || message.length > 5000
  ) {
    return res.status(400).json({ success: false, message: 'Please complete every field with valid information.' });
  }
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_PASS.includes('YOUR_')) {
    return res.status(503).json({ success: false, message: 'Email delivery is temporarily unavailable. Please contact us on WhatsApp.' });
  }
  try {
    const destination = process.env.CONTACT_EMAIL || process.env.SMTP_USER;
    await transporter.sendMail({
      from: `"Slugsera Website" <${process.env.SMTP_USER}>`,
      to: destination,
      replyTo: email.trim(),
      subject: `[Website] ${subject.trim()}`,
      text: `Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`,
      html: `<p><strong>Name:</strong> ${escapeHtml(name.trim())}</p><p><strong>Email:</strong> ${escapeHtml(email.trim())}</p><p><strong>Message:</strong></p><p>${escapeHtml(message.trim()).replace(/\n/g, '<br>')}</p>`,
    });
    return res.json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    next(error);
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
// START SERVER (Local only)
// ==========================================
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 API Server running on port ${PORT}`);
    console.log(`CORS allowed origin: ${allowedOrigin}`);
  });
}

export default app;
