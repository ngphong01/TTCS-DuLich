import Link from 'next/link';

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await searchParams;
  
  const errorMessages: { [key: string]: string } = {
    missing_client_id: 'Missing Google Client ID configuration',
    missing_client_secret: 'Missing Google Client Secret configuration',
    invalid_client: 'Invalid client configuration - please check your Google OAuth settings',
    redirect_mismatch: 'Redirect URI mismatch - please check your Google Console configuration',
    invalid_code: 'Invalid authorization code',
    no_auth_code: 'No authorization code received',
    server_error: 'Server error occurred during authentication',
    oauth_failed: 'OAuth authentication failed',
    oauth_init_failed: 'Failed to initiate OAuth flow',
  };

  const errorMessage = errorMessages[params.code || ''] || 'An unknown error occurred';

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Authentication Failed</h1>
        <p className="text-gray-700 mb-4">{errorMessage}</p>
        <p className="text-gray-500 text-sm mb-6">Error code: {params.code || 'unknown'}</p>
        <div className="space-y-2">
          <Link 
            href="/api/auth/oauth/google" 
            className="block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Try Again
          </Link>
          <Link 
            href="/" 
            className="block bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
