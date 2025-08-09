import NextAuth, { type DefaultSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    id?: string;
  }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
