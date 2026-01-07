import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { RATE_LIMIT_LOGIN } from './constants';
import { authService } from './di';
import { rateLimit } from './rate-limit';

// In-memory failed attempts tracker for additional brute force protection
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function checkAndRecordFailedAttempt(email: string): boolean {
  const now = Date.now();
  const record = failedAttempts.get(email);

  if (record) {
    // Reset if lockout period has passed
    if (now - record.lastAttempt > LOCKOUT_DURATION) {
      failedAttempts.delete(email);
      return true;
    }

    // Check if locked out
    if (record.count >= LOCKOUT_THRESHOLD) {
      return false;
    }
  }

  return true;
}

function recordFailedAttempt(email: string): void {
  const now = Date.now();
  const record = failedAttempts.get(email);

  if (record) {
    record.count++;
    record.lastAttempt = now;
  } else {
    failedAttempts.set(email, { count: 1, lastAttempt: now });
  }
}

function clearFailedAttempts(email: string): void {
  failedAttempts.delete(email);
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Rate limiting by email
        const emailRateLimited = !rateLimit(`login:${credentials.email}`, RATE_LIMIT_LOGIN);

        // Rate limiting by IP (if available)
        const forwardedFor = req?.headers?.['x-forwarded-for'];
        const clientIp = Array.isArray(forwardedFor)
          ? forwardedFor[0]
          : forwardedFor?.split(',')[0]?.trim() || 'unknown';
        const ipRateLimited = !rateLimit(`login:ip:${clientIp}`, RATE_LIMIT_LOGIN);

        if (emailRateLimited || ipRateLimited) {
          // Return null to indicate auth failure (rate limited)
          // Note: NextAuth doesn't support custom error messages in authorize
          return null;
        }

        // Check for account lockout due to failed attempts
        if (!checkAndRecordFailedAttempt(credentials.email)) {
          return null;
        }

        const user = await authService.authenticateUser(credentials.email, credentials.password);

        if (!user) {
          // Record failed attempt
          recordFailedAttempt(credentials.email);
          return null;
        }

        // Clear failed attempts on successful login
        clearFailedAttempts(credentials.email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    // Session expires in 24 hours
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
