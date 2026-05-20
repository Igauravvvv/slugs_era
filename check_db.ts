import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
(globalThis as any).import = { meta: { env: process.env } };
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('products').select('*').limit(1);
  console.log("DATA:", JSON.stringify(data, null, 2));
  if (error) console.log("ERROR:", error);
}
check();
