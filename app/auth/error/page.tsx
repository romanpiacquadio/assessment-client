'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have permission to access this application.';
      case 'Verification':
        return 'The verification link has expired or has already been used.';
      case 'OAuthSignin':
        return 'Error in the OAuth login process.';
      case 'OAuthCallback':
        return 'Error in the OAuth callback.';
      case 'OAuthCreateAccount':
        return 'Could not create the OAuth account.';
      case 'EmailCreateAccount':
        return 'Could not create the email account.';
      case 'Callback':
        return 'Error in the authentication callback.';
      case 'OAuthAccountNotLinked':
        return 'This account is already associated with another provider.';
      case 'EmailSignin':
        return 'Error sending the email verification.';
      case 'CredentialsSignin':
        return 'Invalid credentials.';
      case 'SessionRequired':
        return 'A session is required.';
      default:
        return 'An unexpected error occurred during authentication.';
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto max-w-md p-6 text-center">
        <h1 className="mb-4 text-2xl font-bold text-red-600">Authentication Error</h1>
        <p className="mb-6 text-gray-600">{getErrorMessage(error)}</p>

        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="block w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Try again
          </Link>

          <Link
            href="/"
            className="block w-full rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            Back to home
          </Link>
        </div>

        {error && (
          <div className="mt-4 rounded bg-gray-100 p-3 text-sm">
            <p className="font-semibold">Error code:</p>
            <p className="font-mono">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
