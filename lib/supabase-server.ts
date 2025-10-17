import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export function createSupabaseForClaims(claims: Record<string, any>) {
  const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  const jwtSecret = requireEnv('SUPABASE_JWT_SECRET');

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
