-- ============================================================
-- SLUGSERA Admin Dashboard v2 — Complete Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- ─── PRODUCTS TABLE (v2) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  category        TEXT,
  sku             TEXT UNIQUE,
  price           NUMERIC(10,2) NOT NULL,
  compare_at_price NUMERIC(10,2),
  on_sale         BOOLEAN DEFAULT false,
  discount_value  NUMERIC(10,2),
  discount_type   TEXT DEFAULT 'percent',
  sale_price      NUMERIC(10,2),
  cost_of_goods   NUMERIC(10,2) DEFAULT 0,
  stock_quantity  INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  ribbon          TEXT,
  is_visible      BOOLEAN DEFAULT true,
  show_in_pos     BOOLEAN DEFAULT true,
  product_info    TEXT,
  return_policy   TEXT,
  shipping_info   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── PRODUCT IMAGES TABLE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_product_images (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID REFERENCES admin_products(id) ON DELETE CASCADE,
  url             TEXT NOT NULL,
  position        INTEGER DEFAULT 0,
  is_primary      BOOLEAN DEFAULT false
);

-- ─── PRODUCT VARIANTS TABLE ─────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_product_variants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID REFERENCES admin_products(id) ON DELETE CASCADE,
  variant_name    TEXT,
  size            TEXT,
  color           TEXT,
  sku_suffix      TEXT,
  price_override  NUMERIC(10,2),
  stock_quantity  INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── ORDERS TABLE (v2) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    TEXT UNIQUE,
  customer_name   TEXT NOT NULL,
  customer_email  TEXT,
  customer_phone  TEXT,
  shipping_address JSONB,
  items           JSONB,
  subtotal        NUMERIC(10,2),
  shipping_fee    NUMERIC(10,2) DEFAULT 0,
  total           NUMERIC(10,2),
  payment_method  TEXT,
  payment_status  TEXT DEFAULT 'Pending',
  status          TEXT DEFAULT 'Pending',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── CUSTOMERS TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_customers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  email           TEXT UNIQUE,
  phone           TEXT,
  city            TEXT,
  state           TEXT,
  total_orders    INTEGER DEFAULT 0,
  total_spent     NUMERIC(10,2) DEFAULT 0,
  last_order_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── ANALYTICS EVENTS TABLE ─────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_analytics_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date            DATE NOT NULL,
  sessions        INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  page_views      INTEGER DEFAULT 0,
  source          TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── SITE SETTINGS TABLE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_site_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name      TEXT DEFAULT 'Slugsera',
  currency        TEXT DEFAULT 'INR',
  currency_symbol TEXT DEFAULT '₹',
  timezone        TEXT DEFAULT 'Asia/Kolkata',
  founder_name    TEXT,
  founder_email   TEXT,
  logo_url        TEXT,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_admin_products_category ON admin_products(category);
CREATE INDEX IF NOT EXISTS idx_admin_products_visible ON admin_products(is_visible);
CREATE INDEX IF NOT EXISTS idx_admin_products_sku ON admin_products(sku);
CREATE INDEX IF NOT EXISTS idx_admin_orders_status ON admin_orders(status);
CREATE INDEX IF NOT EXISTS idx_admin_orders_created ON admin_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_orders_number ON admin_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_admin_customers_email ON admin_customers(email);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_date ON admin_analytics_events(date);
CREATE INDEX IF NOT EXISTS idx_admin_product_images_product ON admin_product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_admin_product_variants_product ON admin_product_variants(product_id);

-- ─── AUTO-UPDATE updated_at ─────────────────────────────────
CREATE OR REPLACE FUNCTION admin_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS admin_products_updated_at ON admin_products;
CREATE TRIGGER admin_products_updated_at
  BEFORE UPDATE ON admin_products
  FOR EACH ROW EXECUTE FUNCTION admin_update_updated_at();

DROP TRIGGER IF EXISTS admin_orders_updated_at ON admin_orders;
CREATE TRIGGER admin_orders_updated_at
  BEFORE UPDATE ON admin_orders
  FOR EACH ROW EXECUTE FUNCTION admin_update_updated_at();

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
ALTER TABLE admin_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_site_settings ENABLE ROW LEVEL SECURITY;

-- Policies: only authenticated users can do anything
DROP POLICY IF EXISTS "Auth full access admin_products" ON admin_products;
CREATE POLICY "Auth full access admin_products" ON admin_products FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Auth full access admin_product_images" ON admin_product_images;
CREATE POLICY "Auth full access admin_product_images" ON admin_product_images FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Auth full access admin_product_variants" ON admin_product_variants;
CREATE POLICY "Auth full access admin_product_variants" ON admin_product_variants FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Auth full access admin_orders" ON admin_orders;
CREATE POLICY "Auth full access admin_orders" ON admin_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Auth full access admin_customers" ON admin_customers;
CREATE POLICY "Auth full access admin_customers" ON admin_customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Auth full access admin_analytics_events" ON admin_analytics_events;
CREATE POLICY "Auth full access admin_analytics_events" ON admin_analytics_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Auth full access admin_site_settings" ON admin_site_settings;
CREATE POLICY "Auth full access admin_site_settings" ON admin_site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public read for products (storefront needs it)
DROP POLICY IF EXISTS "Public read admin_products" ON admin_products;
CREATE POLICY "Public read admin_products" ON admin_products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read admin_product_images" ON admin_product_images;
CREATE POLICY "Public read admin_product_images" ON admin_product_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read admin_product_variants" ON admin_product_variants;
CREATE POLICY "Public read admin_product_variants" ON admin_product_variants FOR SELECT USING (true);

-- ─── STORAGE BUCKET ─────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- ─── SEED SITE SETTINGS ─────────────────────────────────────
INSERT INTO admin_site_settings (store_name, founder_name, founder_email, currency, currency_symbol, timezone)
VALUES ('Slugsera', 'Gaurav', 'slugsera@gmail.com', 'INR', '₹', 'Asia/Kolkata')
ON CONFLICT DO NOTHING;

-- ─── SEED PRODUCTS ──────────────────────────────────────────
INSERT INTO admin_products (name, description, category, sku, price, compare_at_price, on_sale, discount_value, discount_type, sale_price, cost_of_goods, stock_quantity, low_stock_threshold, ribbon, is_visible, product_info, return_policy, shipping_info)
VALUES
  ('Owns The Game II', 'Oversized graphic tee with bold typography. Premium 240 GSM cotton.', 'Tee', 'SLG-OTG2', 1499.00, 1999.00, true, 25, 'percent', 1499.00, 450.00, 24, 5, 'Bestseller', true,
   'Fabric: 100% Premium Cotton, 240 GSM\nFit: Oversized\nNeck: Round Neck\nSleeve: Half Sleeve',
   '7-day exchange policy. Items must be unworn with tags attached.',
   'Free shipping across India. Delivery in 3-5 business days.'),

  ('HoLLy', 'Streetwear-inspired oversized tee with vintage wash finish.', 'Tee', 'SLG-HLLY', 1499.00, NULL, false, NULL, NULL, NULL, 420.00, 18, 5, 'New', true,
   'Fabric: 100% Premium Cotton, 240 GSM\nFit: Oversized\nFinish: Vintage Enzyme Wash',
   '7-day exchange policy. Items must be unworn with tags attached.',
   'Free shipping across India. Delivery in 3-5 business days.'),

  ('Emotionally Unavailable', 'Statement oversized tee. Slow fashion for the emotionally guarded.', 'Tee', 'SLG-EMUN', 1499.00, NULL, false, NULL, NULL, NULL, 380.00, 31, 5, NULL, true,
   'Fabric: 100% Premium Cotton, 240 GSM\nFit: Oversized\nPrint: Screen Print',
   '7-day exchange policy. Items must be unworn with tags attached.',
   'Free shipping across India. Delivery in 3-5 business days.'),

  ('Cherry Blossom', 'Floral graphic oversized tee with sakura-inspired print.', 'Tee', 'SLG-CHRB', 1499.00, 1999.00, true, 25, 'percent', 1499.00, 440.00, 12, 5, 'Sale', true,
   'Fabric: 100% Premium Cotton, 240 GSM\nFit: Oversized\nPrint: DTG (Direct to Garment)',
   '7-day exchange policy. Items must be unworn with tags attached.',
   'Free shipping across India. Delivery in 3-5 business days.'),

  ('Owns The Game', 'Original edition oversized tee. The one that started it all.', 'Tee', 'SLG-OTG1', 1299.00, NULL, false, NULL, NULL, NULL, 350.00, 8, 5, NULL, true,
   'Fabric: 100% Premium Cotton, 220 GSM\nFit: Oversized\nPrint: Screen Print',
   '7-day exchange policy. Items must be unworn with tags attached.',
   'Free shipping across India. Delivery in 3-5 business days.'),

  ('Loviee (Men)', 'Unisex-fit oversized tee with minimalist love-themed graphic.', 'Tee', 'SLG-LOVM', 1499.00, NULL, false, NULL, NULL, NULL, 400.00, 20, 5, NULL, true,
   'Fabric: 100% Premium Cotton, 240 GSM\nFit: Oversized\nFor: Men',
   '7-day exchange policy. Items must be unworn with tags attached.',
   'Free shipping across India. Delivery in 3-5 business days.'),

  ('Loviee (Women)', 'Women''s-fit tee with minimalist love-themed graphic.', 'Tee', 'SLG-LOVW', 1499.00, NULL, false, NULL, NULL, NULL, 400.00, 15, 5, NULL, true,
   'Fabric: 100% Premium Cotton, 200 GSM\nFit: Relaxed\nFor: Women',
   '7-day exchange policy. Items must be unworn with tags attached.',
   'Free shipping across India. Delivery in 3-5 business days.')
ON CONFLICT (sku) DO NOTHING;

-- ─── SEED VARIANTS ──────────────────────────────────────────
-- Add 2 variants (S/Black, M/Black) per product
DO $$
DECLARE
  prod RECORD;
BEGIN
  FOR prod IN SELECT id, name FROM admin_products LOOP
    INSERT INTO admin_product_variants (product_id, variant_name, size, color, sku_suffix, stock_quantity)
    VALUES
      (prod.id, 'S / Black', 'S', 'Black', '-S-BLK', FLOOR(RANDOM() * 15 + 3)::int),
      (prod.id, 'M / Black', 'M', 'Black', '-M-BLK', FLOOR(RANDOM() * 15 + 3)::int)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- ─── SEED SAMPLE ORDERS ─────────────────────────────────────
INSERT INTO admin_orders (order_number, customer_name, customer_email, customer_phone, shipping_address, items, subtotal, shipping_fee, total, payment_method, payment_status, status, created_at)
VALUES
  ('#SLG-1001', 'Rahul Sharma', 'rahul@gmail.com', '9876543210',
   '{"street":"B-42 Sector 18","city":"Noida","state":"UP","pincode":"201301","country":"India"}'::jsonb,
   '[{"name":"Owns The Game II","qty":1,"price":1499,"size":"M"}]'::jsonb,
   1499, 0, 1499, 'UPI', 'Paid', 'Delivered', NOW() - INTERVAL '2 days'),

  ('#SLG-1002', 'Priya Patel', 'priya.p@gmail.com', '9123456789',
   '{"street":"A-101 Marine Drive","city":"Mumbai","state":"MH","pincode":"400002","country":"India"}'::jsonb,
   '[{"name":"Cherry Blossom","qty":1,"price":1499,"size":"S"},{"name":"HoLLy","qty":1,"price":1499,"size":"M"}]'::jsonb,
   2998, 0, 2998, 'Card', 'Paid', 'Dispatched', NOW() - INTERVAL '1 day'),

  ('#SLG-1003', 'Arjun Mehta', 'arjun.m@outlook.com', '9988776655',
   '{"street":"12 MG Road","city":"Bangalore","state":"KA","pincode":"560001","country":"India"}'::jsonb,
   '[{"name":"Emotionally Unavailable","qty":2,"price":1499,"size":"L"}]'::jsonb,
   2998, 0, 2998, 'UPI', 'Paid', 'Processing', NOW() - INTERVAL '6 hours'),

  ('#SLG-1004', 'Sneha Gupta', 'sneha.g@gmail.com', '8877665544',
   '{"street":"45 Park Street","city":"Kolkata","state":"WB","pincode":"700016","country":"India"}'::jsonb,
   '[{"name":"Loviee (Women)","qty":1,"price":1499,"size":"S"}]'::jsonb,
   1499, 0, 1499, 'COD', 'Pending', 'Pending', NOW()),

  ('#SLG-1005', 'Vikram Singh', 'vikram@gmail.com', '7766554433',
   '{"street":"22 Civil Lines","city":"Jaipur","state":"RJ","pincode":"302001","country":"India"}'::jsonb,
   '[{"name":"Owns The Game","qty":1,"price":1299,"size":"M"}]'::jsonb,
   1299, 0, 1299, 'UPI', 'Paid', 'Pending', NOW() - INTERVAL '3 hours')
ON CONFLICT (order_number) DO NOTHING;

-- ─── SEED CUSTOMERS ─────────────────────────────────────────
INSERT INTO admin_customers (name, email, phone, city, state, total_orders, total_spent, last_order_at)
VALUES
  ('Rahul Sharma', 'rahul@gmail.com', '9876543210', 'Noida', 'UP', 3, 4497.00, NOW() - INTERVAL '2 days'),
  ('Priya Patel', 'priya.p@gmail.com', '9123456789', 'Mumbai', 'MH', 2, 5497.00, NOW() - INTERVAL '1 day'),
  ('Arjun Mehta', 'arjun.m@outlook.com', '9988776655', 'Bangalore', 'KA', 1, 2998.00, NOW() - INTERVAL '6 hours'),
  ('Sneha Gupta', 'sneha.g@gmail.com', '8877665544', 'Kolkata', 'WB', 1, 1499.00, NOW()),
  ('Vikram Singh', 'vikram@gmail.com', '7766554433', 'Jaipur', 'RJ', 1, 1299.00, NOW() - INTERVAL '3 hours'),
  ('Ananya Reddy', 'ananya.r@gmail.com', '9654321876', 'Hyderabad', 'TS', 4, 7996.00, NOW() - INTERVAL '5 days'),
  ('Karan Chopra', 'karan.c@gmail.com', '8899001122', 'Delhi', 'DL', 2, 2998.00, NOW() - INTERVAL '7 days')
ON CONFLICT (email) DO NOTHING;

-- ─── SEED ANALYTICS ─────────────────────────────────────────
INSERT INTO admin_analytics_events (date, sessions, unique_visitors, page_views, source)
SELECT
  d::date,
  FLOOR(RANDOM() * 200 + 50)::int,
  FLOOR(RANDOM() * 150 + 30)::int,
  FLOOR(RANDOM() * 600 + 100)::int,
  (ARRAY['Direct','Instagram','Google','Twitter','Facebook'])[FLOOR(RANDOM() * 5 + 1)::int]
FROM generate_series(NOW() - INTERVAL '30 days', NOW(), INTERVAL '1 day') d
ON CONFLICT DO NOTHING;
