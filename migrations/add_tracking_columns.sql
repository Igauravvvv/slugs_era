-- Migration: Add tracking columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS courier TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_status TEXT DEFAULT 'pending';

-- Add missing customer columns if they don't exist
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- One-time update to backfill email
-- 1. Try to get it from shipping_address JSON if it contains email
UPDATE public.orders 
SET email = shipping_address->>'email'
WHERE email IS NULL AND shipping_address ? 'email';

-- 2. Try to get it from customer_email if still null
UPDATE public.orders 
SET email = customer_email 
WHERE email IS NULL AND customer_email IS NOT NULL;

-- 3. Fallback: Get it from the users table using user_id
UPDATE public.orders 
SET email = users.email
FROM public.users
WHERE orders.email IS NULL AND orders.user_id = users.id;
