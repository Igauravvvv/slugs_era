-- Product availability controls the storefront card state.
-- active: normal purchasable item
-- coming_soon: blurred locked card with a Coming Soon overlay
-- sold_out: visible but unavailable item
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_status_check;

ALTER TABLE public.products
  ADD CONSTRAINT products_status_check
  CHECK (status IN ('active', 'coming_soon', 'sold_out'));

CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
