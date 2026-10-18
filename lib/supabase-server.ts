import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

function requireEnvironment(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Missing env ${name}`);
  }
  return value;
}

export function createSupabaseForClaims(
  claims: Readonly<Record<string, unknown>>
): SupabaseClient {
  const supabaseUrl = requireEnvironment('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = requireEnvironment('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  const jwtSecret = requireEnvironment('SUPABASE_JWT_SECRET');

  const token = jwt.sign(
    { ...claims, role: 'authenticated' },
    jwtSecret,
    { algorithm: 'HS256', expiresIn: '5m' }
  );

  return createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}