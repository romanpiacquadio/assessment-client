'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-600 mb-6">{getErrorMessage(error)}</p>
        
        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="block w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try again
          </Link>
          
          <Link
            href="/"
            className="block w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to home
          </Link>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <p className="font-semibold">Error code:</p>
            <p className="font-mono">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
} 