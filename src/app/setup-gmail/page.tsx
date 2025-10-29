"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupGmailPage() {
  const [loading, setLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState('');
  const [code, setCode] = useState('');
  const [result, setResult] = useState('');
  const router = useRouter();

  const getAuthUrl = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/setup-gmail');
      const data = await response.json();
      
      if (data.success) {
        setAuthUrl(data.authUrl);
        setResult('✅ Auth URL generated. Click the link below to authorize Gmail API.');
      } else {
        setResult('❌ Failed to generate auth URL');
      }
    } catch (error) {
      setResult('❌ Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const exchangeCode = async () => {
    if (!code) {
      setResult('❌ Please enter authorization code');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/setup-gmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(`✅ ${data.message}\n\nRefresh Token: ${data.refreshToken}\n\nAdd this to your .env.local:\nGMAIL_REFRESH_TOKEN=${data.refreshToken}`);
      } else {
        setResult('❌ ' + data.error);
      }
    } catch (error) {
      setResult('❌ Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Setup Gmail API
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Configure Gmail API to send password reset emails
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          {/* Step 1: Get Auth URL */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Step 1: Generate Authorization URL
            </h3>
            <button
              onClick={getAuthUrl}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Get Authorization URL'}
            </button>
            
            {authUrl && (
              <div className="mt-4">
                <a
                  href={authUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-500 underline break-all"
                >
                  {authUrl}
                </a>
                <p className="text-sm text-gray-500 mt-2">
                  Click this link to authorize Gmail API access
                </p>
              </div>
            )}
          </div>

          {/* Step 2: Exchange Code */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Step 2: Exchange Authorization Code
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Authorization Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste the code from the authorization page"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <button
                onClick={exchangeCode}
                disabled={loading || !code}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Exchanging...' : 'Exchange Code for Tokens'}
              </button>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Result:</h3>
              <pre className="bg-gray-100 p-4 rounded-md text-sm whitespace-pre-wrap overflow-auto">
                {result}
              </pre>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Setup Instructions:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600">Google Cloud Console</a></li>
              <li>Enable Gmail API in APIs & Services</li>
              <li>Create OAuth 2.0 credentials</li>
              <li>Add your domain to authorized origins</li>
              <li>Use the authorization URL above to get tokens</li>
              <li>Add the refresh token to your .env.local file</li>
            </ol>
          </div>

          <div className="mt-6">
            <button
              onClick={() => router.back()}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
