'use client';

import { useEffect, useState } from 'react';
import { type Session } from 'next-auth';
import { getSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const GoogleIcon = () => (
  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-label="Google logo">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const LoadingSpinner = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

export default function SignIn() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadSession = async () => {
      try {
        const currentSession = await getSession();
        setSession(currentSession);

        // If already authenticated, redirect to home
        if (currentSession) {
          router.push('/');
          return;
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [router]);

  const handleGoogleSignIn = async () => {
    try {
      setSigningIn(true);
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Sign in error:', error);
      setSigningIn(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // This case should rarely show due to redirect in useEffect,
  // but keeping it for edge cases
  if (session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold">Already Authenticated</h1>
          <p className="text-gray-600">
            Signed in as: <span className="font-medium">{session.user?.email}</span>
          </p>
          <div className="space-y-2">
            <Button onClick={() => router.push('/')} className="w-full">
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              className="w-full"
            >
              Switch Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>
          <p className="mt-2 text-gray-600">Sign in to continue to your assessment</p>
        </div>

        <div className="mt-8">
          <Button
            onClick={handleGoogleSignIn}
            disabled={signingIn}
            variant="outline"
            className="flex w-full items-center justify-center border border-gray-300 bg-white px-4 py-3 text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {signingIn ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                Signing in...
              </>
            ) : (
              <>
                <GoogleIcon />
                Sign in with Google
              </>
            )}
          </Button>
        </div>
        <div className="text-center text-sm text-gray-500">
          <p>Only @cloudx.com accounts are allowed</p>
        </div>
      </div>
    </div>
  );
}
