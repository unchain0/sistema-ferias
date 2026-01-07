import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedAdmin: SupabaseClient | null = null;

// Admin client (server-only). Requires SUPABASE_SERVICE_ROLE_KEY.
// Lazy-init so scripts/tests can load env first.
export function getSupabaseAdmin(): SupabaseClient {
  if (cachedAdmin) return cachedAdmin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // Return a proxy or a dummy client that throws on usage if in test environment
    // OR just return null and let the caller handle it.
    // However, for repositories we want them to fail LATE (when methods are called)
    // rather than at module import time.
    return createClient(url || 'http://localhost:54321', key || 'dummy');
  }

  cachedAdmin = createClient(url, key);

  return cachedAdmin;
}
