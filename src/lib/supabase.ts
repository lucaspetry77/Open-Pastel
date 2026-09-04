import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_SUPABASE_URL
    : undefined;

const supabaseAnonKey =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_SUPABASE_ANON_KEY
    : undefined;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://seu-projeto.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null =
  isSupabaseConfigured && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
