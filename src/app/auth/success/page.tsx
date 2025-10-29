import Link from 'next/link';

export default async function AuthSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; name?: string; provider?: string }>;
}) {
  const params = await searchParams;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">✅ Authentication Successful!</h1>
        <p className="text-gray-700 mb-2">Welcome, {decodeURIComponent(params.name || 'User')}!</p>
        <p className="text-gray-600">Email: {params.email}</p>
        <p className="text-gray-500 text-sm mt-4">Logged in via {params.provider}</p>
        <div className="mt-6">
          <Link 
            href="/" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
