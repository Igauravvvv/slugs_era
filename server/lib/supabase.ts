import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Assert types to prevent TypeScript errors. 
// These should exist in the environment via dotenv.
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    'Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined in the environment. ' +
    'Using placeholder values. Server will run but database calls will fail.'
  );
}

/**
 * Service Role Client
 * IMPORTANT: Has bypass capabilities for Row Level Security (RLS). 
 * Never expose this key or instantiate this client on the front-end!
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
