import CredentialsProvider from 'next-auth/providers/credentials';

import type { NextAuthOptions } from 'next-auth';

import { authenticateUser } from './auth';

function requireEnvironment(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Missing env ${name}`);
  }
  return value;
}

export const authOptions: NextAuthOptions = {
  secret: requireEnvironment('NEXTAUTH_SECRET'),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (email === undefined || email === '' || password === undefined || password === '') {
          return null;
        }

        const user = await authenticateUser(email, password);
        if (user === null) {
          return null;
        }

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
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt({ token, user }) {
      // On sign-in, NextAuth passes the user object; copy id onto the JWT.
      const signedIn = user as { id?: string } | undefined;
      if (signedIn?.id !== undefined) {
        token.id = signedIn.id;
      }
      return token;
    },
    session({ session, token }) {
      const sessionUser = session.user as { id?: string } | undefined;
      if (sessionUser !== undefined && typeof token.id === 'string') {
        sessionUser.id = token.id;
      }
      return session;
    },
  },
};
