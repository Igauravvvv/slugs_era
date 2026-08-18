-- Slugsera storefront + dashboard upgrade
-- Run this once in the Supabase SQL editor before deploying this release.

-- Product classification and exact per-size inventory.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS size_stock JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Never let a stale aggregate stock value disagree with size-level inventory
-- after an admin has entered a size breakdown.
CREATE OR REPLACE FUNCTION public.sync_product_stock_quantity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF jsonb_typeof(COALESCE(NEW.size_stock, '[]'::jsonb)) = 'array'
     AND jsonb_array_length(COALESCE(NEW.size_stock, '[]'::jsonb)) > 0 THEN
    NEW.stock_quantity := COALESCE((
      SELECT SUM(GREATEST(0, COALESCE((item->>'stock')::integer, 0)))
      FROM jsonb_array_elements(NEW.size_stock) AS item
    ), 0);
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_sync_stock_quantity ON public.products;
CREATE TRIGGER products_sync_stock_quantity
BEFORE INSERT OR UPDATE OF size_stock, stock_quantity ON public.products
FOR EACH ROW EXECUTE FUNCTION public.sync_product_stock_quantity();

-- A profile is created from every Supabase Auth user. This is deliberately
-- separate from auth.users so admin screens never need a service-role key.
CREATE OR REPLACE FUNCTION public.handle_new_storefront_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, public.users.name);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_storefront_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_storefront_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_storefront_user();

-- Backfill profiles for people who already have an account.
INSERT INTO public.users (id, email, name)
SELECT id, COALESCE(email, ''), COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name')
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name);

-- Anonymous or signed-in behavioural events. Email is intentionally not
-- stored here; a signed-in event carries only auth user_id and is visible to
-- admins through RLS.
CREATE TABLE IF NOT EXISTS public.customer_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL CHECK (event_name IN ('page_view', 'product_clicked', 'product_viewed', 'size_selected', 'add_to_cart', 'quick_add', 'signed_in')),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id UUID NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS customer_events_created_at_idx ON public.customer_events (created_at DESC);
CREATE INDEX IF NOT EXISTS customer_events_product_idx ON public.customer_events (product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS customer_events_user_idx ON public.customer_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS customer_events_event_idx ON public.customer_events (event_name, created_at DESC);

ALTER TABLE public.customer_events ENABLE ROW LEVEL SECURITY;

-- Keep this helper aligned with the existing dashboard route allowlist.
CREATE OR REPLACE FUNCTION public.is_dashboard_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(auth.jwt() ->> 'email', '') IN ('slugsera@gmail.com', 'igauravvvv@gmail.com');
$$;

DROP POLICY IF EXISTS "Storefront can record customer events" ON public.customer_events;
CREATE POLICY "Storefront can record customer events"
ON public.customer_events FOR INSERT
TO anon, authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Dashboard can read customer events" ON public.customer_events;
CREATE POLICY "Dashboard can read customer events"
ON public.customer_events FOR SELECT
TO authenticated
USING (public.is_dashboard_admin());

DROP POLICY IF EXISTS "Dashboard can read user profiles" ON public.users;
CREATE POLICY "Dashboard can read user profiles"
ON public.users FOR SELECT
TO authenticated
USING (public.is_dashboard_admin());
