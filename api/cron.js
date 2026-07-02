import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Read from Vercel's environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Missing Supabase credentials in Vercel environment' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // A lightweight query to keep the Supabase free tier project awake
  const { data, error } = await supabase.from('products').select('id').limit(1);

  if (error) {
    console.error('Supabase ping failed:', error.message);
    return res.status(500).json({ error: error.message });
  }

  console.log('Supabase successfully pinged via Vercel Cron!');
  res.status(200).json({ success: true, message: 'Supabase pinged successfully!' });
}
