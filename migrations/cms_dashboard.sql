-- ============================================================
-- SLUGSERA CMS DASHBOARD — Database Migration
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ─── PRODUCTS TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  category TEXT,
  sizes TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Safely add missing columns in case table already exists from schema.sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_price NUMERIC(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS season TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS drop_name TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Fix images column type (was TEXT[] in old schema, needs to be JSONB)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='images' AND data_type='ARRAY') THEN
    ALTER TABLE products DROP COLUMN images;
  END IF;
END $$;
ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- ─── SEASONAL DROPS TABLE ───────────────────────────────────
CREATE TABLE IF NOT EXISTS drops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,               -- "Obsidian Drop SS25"
  season TEXT NOT NULL,
  drop_date DATE,
  cover_image_url TEXT,             -- CDN URL
  description TEXT,
  is_active BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'coming_soon', -- 'active' | 'coming_soon' | 'archived'
  product_ids UUID[] DEFAULT '{}',  -- array of product UUIDs assigned to this drop
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── SITE SECTIONS TABLE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,  -- 'hero', 'about', 'featured_drop', 'footer'
  title TEXT,
  subtitle TEXT,
  body_text TEXT,
  image_url TEXT,                    -- CDN URL
  cta_text TEXT,
  cta_link TEXT,
  meta JSONB DEFAULT '{}'::jsonb,    -- any extra fields (overlay_opacity, text_align, etc.)
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── CATEGORIES TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_season ON products(season);
CREATE INDEX IF NOT EXISTS idx_products_published ON products(is_published);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sort ON products(sort_order);
CREATE INDEX IF NOT EXISTS idx_drops_season ON drops(season);
CREATE INDEX IF NOT EXISTS idx_drops_active ON drops(is_active);
CREATE INDEX IF NOT EXISTS idx_drops_sort ON drops(sort_order);
CREATE INDEX IF NOT EXISTS idx_site_sections_key ON site_sections(section_key);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);

-- ─── AUTO-UPDATE updated_at TRIGGER ─────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_products_updated_at ON products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_drops_updated_at ON drops;
CREATE TRIGGER set_drops_updated_at
  BEFORE UPDATE ON drops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_site_sections_updated_at ON site_sections;
CREATE TRIGGER set_site_sections_updated_at
  BEFORE UPDATE ON site_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── SEED DEFAULT SITE SECTIONS ─────────────────────────────
INSERT INTO site_sections (section_key, title, subtitle, cta_text, cta_link, meta)
VALUES
  ('hero', 'SLUGSERA', 'Premium Slow Fashion', 'Shop Now', '/collections', '{"overlay_opacity": 40, "text_align": "center"}'::jsonb),
  ('about', 'Our Story', 'Crafted for the unhurried.', NULL, NULL, '{}'::jsonb),
  ('featured_drop', 'Now Live', 'Obsidian Drop SS25', 'Explore Drop', '/collections', '{}'::jsonb),
  ('footer', 'SLUGSERA', NULL, NULL, NULL, '{"social": {"instagram": "", "twitter": "", "tiktok": ""}}'::jsonb)
ON CONFLICT (section_key) DO NOTHING;

-- ─── SEED DEFAULT CATEGORIES ────────────────────────────────
INSERT INTO categories (name, slug, sort_order)
VALUES
  ('Tops', 'tops', 1),
  ('Bottoms', 'bottoms', 2),
  ('Outerwear', 'outerwear', 3),
  ('Accessories', 'accessories', 4)
ON CONFLICT (slug) DO NOTHING;

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────

-- Products: public read, authenticated write
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published products" ON products;
CREATE POLICY "Public can read published products"
  ON products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;
CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Drops: public read, authenticated write
ALTER TABLE drops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read drops" ON drops;
CREATE POLICY "Public can read drops"
  ON drops FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage drops" ON drops;
CREATE POLICY "Authenticated users can manage drops"
  ON drops FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Site Sections: public read, authenticated write
ALTER TABLE site_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read site sections" ON site_sections;
CREATE POLICY "Public can read site sections"
  ON site_sections FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage site sections" ON site_sections;
CREATE POLICY "Authenticated users can manage site sections"
  ON site_sections FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Categories: public read, authenticated write
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read categories" ON categories;
CREATE POLICY "Public can read categories"
  ON categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;
CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─── STORAGE BUCKETS ─────────────────────────────────────────
-- Create these via Supabase Dashboard > Storage, or run:
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('product-images', 'product-images', true),
  ('section-images', 'section-images', true),
  ('drop-covers', 'drop-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, authenticated upload
DROP POLICY IF EXISTS "Public read product-images" ON storage.objects;
CREATE POLICY "Public read product-images"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('product-images', 'section-images', 'drop-covers'));

DROP POLICY IF EXISTS "Auth upload product-images" ON storage.objects;
CREATE POLICY "Auth upload product-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('product-images', 'section-images', 'drop-covers'));

DROP POLICY IF EXISTS "Auth update product-images" ON storage.objects;
CREATE POLICY "Auth update product-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id IN ('product-images', 'section-images', 'drop-covers'));

DROP POLICY IF EXISTS "Auth delete product-images" ON storage.objects;
CREATE POLICY "Auth delete product-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id IN ('product-images', 'section-images', 'drop-covers'));
