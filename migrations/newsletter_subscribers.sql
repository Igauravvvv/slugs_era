-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Allow inserts from service role (backend), no public access
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write (handled via supabaseAdmin on the server)
-- No public policies needed — all operations go through the backend API
