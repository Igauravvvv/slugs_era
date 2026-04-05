import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Assert types to prevent TypeScript errors. 
// These should exist in the environment via dotenv.
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
}

/**
 * Service Role Client
 * IMPORTANT: Has bypass capabilities for Row Level Security (RLS). 
 * Never expose this key or instantiate this client on the front-end!
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
