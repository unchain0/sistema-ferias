import NextAuth from 'next-auth';

import { authOptions } from '@/lib/auth-config';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- NextAuth return type is complex
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
