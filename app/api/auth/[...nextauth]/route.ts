import NextAuth, { type DefaultSession, type NextAuthOptions } from 'next-auth';
import GoogleProvider, { type GoogleProfile } from 'next-auth/providers/google';

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

const requiredEnvVars = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  ALLOWED_DOMAIN: process.env.ALLOWED_DOMAIN || 'cloudx.com',
} as const;

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value && key !== 'ALLOWED_DOMAIN') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const isValidGoogleProfile = (profile: GoogleProfile): boolean => {
  return Boolean(
    profile?.email_verified &&
    profile?.email?.endsWith(`@${requiredEnvVars.ALLOWED_DOMAIN}`)
  );
};

const logSignInAttempt = (profile: GoogleProfile, granted: boolean): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Authentication ${granted ? 'GRANTED' : 'DENIED'} for ${profile.email}`, {
      email: profile.email,
      emailVerified: profile.email_verified,
      domain: profile.email?.split('@')[1],
    });
  }
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: requiredEnvVars.GOOGLE_CLIENT_ID!,
      clientSecret: requiredEnvVars.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          hd: requiredEnvVars.ALLOWED_DOMAIN,
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== 'google' || !profile) {
        return false;
      }

      const googleProfile = profile as GoogleProfile;
      const isAllowed = isValidGoogleProfile(googleProfile);

      logSignInAttempt(googleProfile, isAllowed);

      return isAllowed;
    },
    async jwt({ token, account, profile }) {
      if (account?.access_token && profile?.sub) {
        token.accessToken = account.access_token;
        token.id = profile.sub;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.accessToken && token.id) {
        session.accessToken = token.accessToken;
        session.user.id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
