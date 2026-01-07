import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing env ${name}. Add it to .env.local (see .env.example).`);
  }
  return v;
}

let cachedAdmin: SupabaseClient | null = null;

// Admin client (server-only). Requires SUPABASE_SERVICE_ROLE_KEY.
// Lazy-init so scripts/tests can load env first.
export function getSupabaseAdmin(): SupabaseClient {
  if (cachedAdmin) return cachedAdmin;

  cachedAdmin = createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  );

  return cachedAdmin;
}
