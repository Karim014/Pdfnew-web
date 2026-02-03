
import { createClient } from '@supabase/supabase-js';

// Access environment variables safely.
// The user provided the project URL: https://ymnuemqryylgqqsdeliz.supabase.co/
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://ymnuemqryylgqqsdeliz.supabase.co/";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

/**
 * We check if the keys are present and not placeholder values before initializing.
 * If they are missing or invalid, we export a null client and services
 * will fall back to local isolated storage.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url' &&
  supabaseAnonKey !== 'your_supabase_anon_key'
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey!)
  : null;
