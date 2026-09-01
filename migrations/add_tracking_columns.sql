-- Migration: Add tracking columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS courier TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_status TEXT DEFAULT 'pending';

-- One-time update to backfill email for orders missing it (but having customer_email)
UPDATE public.orders 
SET email = customer_email 
WHERE email IS NULL AND customer_email IS NOT NULL;
