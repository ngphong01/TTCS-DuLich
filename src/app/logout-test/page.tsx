"use client";
import { useSimpleAuth, signOut } from "@/lib/use-simple-auth";
import { enhancedSignOut, debugLogout } from "@/lib/logout-utils";
import { useState } from "react";

export default function LogoutTestPage() {
  const { data: session, status } = useSimpleAuth();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBasicLogout = async () => {
    addResult("🧪 Testing basic logout...");
    try {
      await signOut({ redirect: true, callbackUrl: "/" });
      addResult("✅ Basic logout completed");
    } catch (error) {
      addResult(`❌ Basic logout failed: ${error.message}`);
    }
  };

  const testEnhancedLogout = async () => {
    addResult("🧪 Testing enhanced logout...");
    try {
      await enhancedSignOut({ redirect: true, callbackUrl: "/" });
      addResult("✅ Enhanced logout completed");
    } catch (error) {
      addResult(`❌ Enhanced logout failed: ${error.message}`);
    }
  };

  const testDebugLogout = () => {
    addResult("🧪 Testing logout debug...");
    const debugInfo = debugLogout();
    addResult(`📊 Debug info: ${JSON.stringify(debugInfo, null, 2)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Logout Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            <p><strong>User:</strong> {session?.user?.name || "Not logged in"}</p>
            <p><strong>Email:</strong> {session?.user?.email || "N/A"}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Logout Tests</h2>
          <div className="space-y-4">
            <button
              onClick={testBasicLogout}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Test Basic Logout
            </button>
            
            <button
              onClick={testEnhancedLogout}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 ml-4"
            >
              Test Enhanced Logout
            </button>
            
            <button
              onClick={testDebugLogout}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 ml-4"
            >
              Debug Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No tests run yet</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}