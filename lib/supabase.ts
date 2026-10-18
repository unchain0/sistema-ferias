import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const anonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

let supabaseClient: SupabaseClient | undefined;

if (supabaseUrl !== undefined && supabaseUrl !== '' && anonKey !== undefined && anonKey !== '') {
  supabaseClient = createClient(supabaseUrl, anonKey);
}

export const supabase = supabaseClient;