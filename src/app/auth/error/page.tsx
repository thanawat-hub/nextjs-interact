'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'Access denied. You do not have permission to sign in.',
    Verification: 'The verification link is invalid or has expired.',
    OAuthSignin: 'Error starting OAuth sign in.',
    OAuthCallback: 'Error processing OAuth callback.',
    OAuthCreateAccount: 'Could not create OAuth account.',
    EmailCreateAccount: 'Could not create email account.',
    Callback: 'Error in callback handler.',
    OAuthAccountNotLinked: 'Email already exists with different provider.',
    EmailSignin: 'Check your email for the sign in link.',
    CredentialsSignin: 'Sign in failed. Check the details you provided.',
    SessionRequired: 'Please sign in to access this page.',
    Default: 'An error occurred during authentication.',
  };

  const message = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-red-950">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            Authentication Error
          </h1>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 space-y-4">
          <p className="text-gray-700 dark:text-gray-300 text-center">
            {message}
          </p>

          {error === 'OAuthAccountNotLinked' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                <strong>Note:</strong> An account with this email already exists. 
                Please sign in with your original provider first, then you can link 
                additional providers from your profile.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button asChild variant="default">
              <Link href="/login">Try Again</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </div>

        {error && (
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Error code: {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
