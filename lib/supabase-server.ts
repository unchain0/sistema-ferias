import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { Session } from 'next-auth';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Missing env ${name}. Add it to .env.local (see .env.example) and restart Next dev server.`,
    );
  }
  return v;
}

export function createSupabaseForClaims(claims: Record<string, string | number | boolean>) {
  const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  const jwtSecret = requireEnv('SUPABASE_JWT_SECRET');

  const token = jwt.sign({ ...claims, role: 'authenticated' }, jwtSecret, {
    algorithm: 'HS256',
    expiresIn: '5m',
  });

  return createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

/**
 * Returns a Supabase client authenticated as the current user.
 * This client respects Row Level Security (RLS) policies.
 */
export function getSupabaseUserClient(session: Session) {
  if (!session?.user?.id || !session?.user?.email) {
    throw new Error('Unauthorized: Missing session user data');
  }

  return createSupabaseForClaims({
    sub: session.user.id,
    email: session.user.email,
  });
}
