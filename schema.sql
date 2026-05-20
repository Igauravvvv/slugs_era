-- Supabase SQL Schema for Slug's Era
-- Updated to match actual DB columns used by the codebase

-- Users Table (Handled automatically by Supabase Auth, but we can extend profiles here)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Protect users table (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Products Table
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  price NUMERIC NOT NULL,
  compare_price NUMERIC,
  category TEXT NOT NULL,
  sizes TEXT[] NOT NULL DEFAULT '{}',
  colors JSONB DEFAULT '[]',         -- Array of {name, hex} objects
  images JSONB DEFAULT '[]',         -- Array of {url, alt, isPrimary} objects
  tags JSONB DEFAULT '[]',           -- Array of tag strings (features, badges)
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER DEFAULT 0,      -- For manual product ordering in dashboard
  season TEXT,                        -- e.g. 'SS26', 'AW25'
  drop_name TEXT,                     -- Name of the drop this product belongs to
  badge TEXT,                         -- e.g. 'Bestseller', 'New Arrival', 'Limited'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products are readable by everyone, but writable only by admins (via backend service role)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);

-- Orders Table
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT,
  user_id UUID REFERENCES public.users(id),
  email TEXT,                          -- For order lookup by email (Profile page)
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  shipping_address JSONB,            -- {street, city, state, pincode, country}
  items JSONB NOT NULL DEFAULT '[]', -- Array of {name, qty, price, size, color, productId}
  subtotal NUMERIC DEFAULT 0,
  shipping_fee NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'Pending',
  payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR email = auth.email());
-- Insert/Update is managed completely by backend via service role key

-- Cart Table (currently unused — cart is localStorage via Zustand persist)
CREATE TABLE public.cart (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, product_id, size)
);

ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own cart" ON public.cart FOR ALL USING (auth.uid() = user_id);

-- Wishlist Table (currently unused — wishlist is localStorage via Zustand persist)
CREATE TABLE public.wishlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own wishlist" ON public.wishlist FOR ALL USING (auth.uid() = user_id);

-- Notify Requests Table (used by ProductDetail for out-of-stock / coming-soon notifications)
CREATE TABLE public.notify_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL,
  product_id TEXT,
  product_name TEXT,
  size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notify_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert notify requests" ON public.notify_requests FOR INSERT WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- CMS DASHBOARD TABLES (for the unified /dashboard admin)
-- ═══════════════════════════════════════════════════════════════

-- Drops (Seasonal Collections)
CREATE TABLE public.drops (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  season TEXT,
  drop_date TIMESTAMP WITH TIME ZONE,
  cover_image_url TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft',
  product_ids UUID[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drops are viewable by everyone" ON public.drops FOR SELECT USING (true);

-- Categories
CREATE TABLE public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  image_url TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

-- Site Sections (Visual Site Editor)
CREATE TABLE public.site_sections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  section_key TEXT UNIQUE NOT NULL,
  title TEXT,
  subtitle TEXT,
  body_text TEXT,
  image_url TEXT,
  cta_text TEXT,
  cta_link TEXT,
  meta JSONB DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site sections are viewable by everyone" ON public.site_sections FOR SELECT USING (true);

-- ── Seed: Default site section content ──────────────────────────
INSERT INTO public.site_sections (section_key, title, subtitle, body_text, image_url, cta_text, cta_link, meta) VALUES

-- Hero
('hero', 'Wear the Philosophy of Slow Culture', 'Premium pieces for those who value intention over impulse. Crafted without compromise.', NULL, NULL, 'Shop Now', '#products',
 '{"eyebrow_sequences": ["Movement. Not Merch — The Slow Club", "Movement. Not Merch — New Season", "Movement. Not Merch — Exclusive Drops", "Movement. Not Merch — Slugs Era"], "tags": ["100% Organic", "Slow Fashion", "5 Drops", "Movement. Not Merch"], "cta_secondary_text": "Our Story", "cta_secondary_link": "#about"}'::jsonb),

-- Marquee
('marquee', NULL, NULL, NULL, NULL, NULL, NULL,
 '{"items": ["The Philosophy of Slow", "Movement. Not Merch", "Coastal Drift — New Drop", "Premium Organic Cotton", "Intentional Fashion", "Wear Less, Wear Better"]}'::jsonb),

-- Products Section
('products', 'The Essential Five', NULL, NULL, NULL, 'View All', '/collections',
 '{"eyebrow": "T-Shirt Collection"}'::jsonb),

-- Shirts Section
('shirts', 'Coastal Drift', 'New Drop — Shirts', 'Drift Like Waves. Stand Like Palms. Camp collar, relaxed fit, printed with the coastal philosophy you live by.', NULL, 'Add to Cart', NULL,
 '{"price_label": "₹2,299 per shirt", "marquee_text": "COAST"}'::jsonb),

-- Values Section
('values', 'Our Journey', NULL, NULL, NULL, NULL, NULL,
 '{"eyebrow": "What We Stand For"}'::jsonb),

-- About Section
('about', 'Born from a quiet rebellion', 'OUR STORY', 'It started with the two of us just searching.\n\nFor that one piece — a little patchwork, a design that felt like you, fabric that moved with your body like water. We''d find something close, then see the price. ₹8,000. ₹12,000. And if it wasn''t expensive, it simply didn''t exist in India — or wasn''t cut for us at all.\n\nSo we stopped searching and started building.\n\nClothes that feel like artwork. Silhouettes made for Indian body types. Fabrics that wear like a second skin. And a price that doesn''t ask you to think twice — ₹1,500 to ₹2,500, because great clothing shouldn''t be a luxury.\n\nSlug''s Era was built in the gap between what existed and what should have.', NULL, NULL, NULL,
 '{"year": "2026", "quote": "We got tired of choosing between things that looked good and things that felt good. So we built something that didn''t ask you to compromise.", "signature_sequences": ["— The Founders", "— The Creators", "— The Visionaries"], "instagram_handle": "@slugsera"}'::jsonb),

-- CTA Section
('cta', 'Shop Premium Pieces', 'Upgrade Your Wardrobe', 'Life is too short for uncomfortable clothes. Invest in essentials that earn their place for years, not months.', NULL, 'Shop T-Shirts — ₹1,899', '/collections?tshirts',
 '{"cta_secondary_text": "Shop Shirts — ₹2,299", "cta_secondary_link": "/collections?shirts", "marquee_text": "Don''t Rush."}'::jsonb),

-- Newsletter Section
('newsletter', 'THE Slow Club , Be a part of the community', 'Stay in the Loop', 'New drops, behind-the-scenes, and the occasional essay on intentional living.', NULL, 'Subscribe', NULL,
 '{"eyebrow_after": "Early access to"}'::jsonb),

-- Footer
('footer', 'MOVEMENT. not Merch', NULL, NULL, NULL, NULL, NULL,
 '{}'::jsonb)

ON CONFLICT (section_key) DO NOTHING;

