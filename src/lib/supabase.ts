import { createClient } from '@supabase/supabase-js';

// Get these from Vite's env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    'Warning: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not defined in the environment. ' +
    'Using placeholder values. Supabase database integration will not work, but local fallback data will be used.'
  );
}

/**
 * Standard Supabase client meant for the browser frontend. 
 * Will abide by Row Level Security policies!
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
