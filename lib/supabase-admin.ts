import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function requireEnvironment(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Missing env ${name}`);
  }
  return value;
}

// Admin client (server-only). Requires SUPABASE_SERVICE_ROLE_KEY.
export const supabaseAdmin: SupabaseClient = createClient(
  requireEnvironment('NEXT_PUBLIC_SUPABASE_URL'),
  requireEnvironment('SUPABASE_SERVICE_ROLE_KEY')
);