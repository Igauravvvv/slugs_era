import { createClient } from '@supabase/supabase-js';

// Get these from Vite's env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

/**
 * Standard Supabase client meant for the browser frontend. 
 * Will abide by Row Level Security policies!
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
