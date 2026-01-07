import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedAdmin: SupabaseClient | null = null;

/**
 * Error thrown when Supabase environment variables are missing
 */
export class SupabaseConfigError extends Error {
  constructor(missingVar: string) {
    super(`Missing required Supabase environment variable: ${missingVar}`);
    this.name = 'SupabaseConfigError';
  }
}

/**
 * Admin client (server-only). Requires SUPABASE_SERVICE_ROLE_KEY.
 * Lazy-init so scripts/tests can load env first.
 *
 * @throws {SupabaseConfigError} When required environment variables are missing
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cachedAdmin) return cachedAdmin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // In test environment, allow dummy values for mocking
  if (process.env.NODE_ENV === 'test' && (!url || !key)) {
    return createClient(url || 'http://localhost:54321', key || 'test-key');
  }

  // In production/development, require proper configuration
  if (!url) {
    throw new SupabaseConfigError('NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!key) {
    throw new SupabaseConfigError('SUPABASE_SERVICE_ROLE_KEY');
  }

  cachedAdmin = createClient(url, key);

  return cachedAdmin;
}

/**
 * Reset the cached admin client (useful for testing)
 */
export function resetSupabaseAdmin(): void {
  cachedAdmin = null;
}
