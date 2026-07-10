import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing connection to Supabase...');
  
  // Test if products table exists
  const { data, error } = await supabase
    .from('products')
    .select('id')
    .limit(1);

  if (error) {
    console.error('Error fetching from products table. Table might not exist or RLS is blocking read:', error);
  } else {
    console.log('Successfully connected to products table:', data);
  }

  // Test if site_sections table exists
  const { data: siteData, error: siteError } = await supabase
    .from('site_sections')
    .select('id')
    .limit(1);

  if (siteError) {
    console.error('Error fetching from site_sections table:', siteError);
  } else {
    console.log('Successfully connected to site_sections table:', siteData);
  }
}

testConnection();
