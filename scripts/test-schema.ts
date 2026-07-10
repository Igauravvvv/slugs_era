import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function checkSchema() {
  const { data: p } = await supabase.from('products').select('*').limit(1);
  console.log('Product schema:', p ? Object.keys(p[0] || {}) : 'No rows');
  
  const { data: s } = await supabase.from('site_sections').select('*').limit(1);
  console.log('Site section schema:', s ? Object.keys(s[0] || {}) : 'No rows');
}

checkSchema();
