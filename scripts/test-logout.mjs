#!/usr/bin/env node

/**
 * Logout Testing Script
 * Test và debug vấn đề logout không thành công
 */

import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log("🚪 Logout Testing Tool");
console.log("=".repeat(50));

// Test logout functionality
function testLogoutFunctionality() {
  console.log("🔍 Testing logout functionality...");
  
  // Check if logout utilities exist
  const logoutUtilsPath = path.join(process.cwd(), 'src', 'lib', 'logout-utils.ts');
  if (fs.existsSync(logoutUtilsPath)) {
    console.log("✅ Logout utilities: Found");
  } else {
    console.log("❌ Logout utilities: Missing");
    return;
  }
  
  // Check if components use enhanced logout
  const navBarPath = path.join(process.cwd(), 'src', 'components', 'NavBar.tsx');
  if (fs.existsSync(navBarPath)) {
    const navBarContent = fs.readFileSync(navBarPath, 'utf8');
    if (navBarContent.includes('enhancedSignOut')) {
      console.log("✅ NavBar: Using enhanced logout");
    } else {
      console.log("⚠️  NavBar: Not using enhanced logout");
    }
  }
  
  const optimizedNavBarPath = path.join(process.cwd(), 'src', 'components', 'OptimizedNavBar.tsx');
  if (fs.existsSync(optimizedNavBarPath)) {
    const optimizedNavBarContent = fs.readFileSync(optimizedNavBarPath, 'utf8');
    if (optimizedNavBarContent.includes('useLogout')) {
      console.log("✅ OptimizedNavBar: Using enhanced logout");
    } else {
      console.log("⚠️  OptimizedNavBar: Not using enhanced logout");
    }
  }
}

// Debug logout issues
function debugLogoutIssues() {
  console.log("🔍 Debugging logout issues...");
  
  console.log("\n📋 Common logout issues:");
  console.log("=".repeat(40));
  
  console.log("\n1️⃣ **Session not clearing:**");
  console.log("   - Check if session cookies are being cleared");
  console.log("   - Verify localStorage cleanup");
  console.log("   - Check NextAuth configuration");
  
  console.log("\n2️⃣ **Redirect not working:**");
  console.log("   - Check callbackUrl configuration");
  console.log("   - Verify redirect: true is set");
  console.log("   - Check for JavaScript errors");
  
  console.log("\n3️⃣ **State not updating:**");
  console.log("   - Check if session state is being updated");
  console.log("   - Verify useSession hook");
  console.log("   - Check for component re-rendering issues");
  
  console.log("\n4️⃣ **NextAuth errors:**");
  console.log("   - Check NEXTAUTH_SECRET");
  console.log("   - Verify session strategy");
  console.log("   - Check JWT configuration");
}

// Generate logout test page
function generateLogoutTestPage() {
  console.log("📝 Generating logout test page...");
  
  const testPageContent = `"use client";
import { useSession, signOut } from "next-auth/react";
import { enhancedSignOut, debugLogout } from "@/lib/logout-utils";
import { useState } from "react";

export default function LogoutTestPage() {
  const { data: session, status } = useSession();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, \`\${new Date().toLocaleTimeString()}: \${message}\`]);
  };

  const testBasicLogout = async () => {
    addResult("🧪 Testing basic logout...");
    try {
      await signOut({ redirect: true, callbackUrl: "/" });
      addResult("✅ Basic logout completed");
    } catch (error) {
      addResult(\`❌ Basic logout failed: \${error.message}\`);
    }
  };

  const testEnhancedLogout = async () => {
    addResult("🧪 Testing enhanced logout...");
    try {
      await enhancedSignOut({ redirect: true, callbackUrl: "/" });
      addResult("✅ Enhanced logout completed");
    } catch (error) {
      addResult(\`❌ Enhanced logout failed: \${error.message}\`);
    }
  };

  const testDebugLogout = () => {
    addResult("🧪 Testing logout debug...");
    const debugInfo = debugLogout();
    addResult(\`📊 Debug info: \${JSON.stringify(debugInfo, null, 2)}\`);
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
}`;

  const testPagePath = path.join(process.cwd(), 'src', 'app', 'logout-test', 'page.tsx');
  const testPageDir = path.dirname(testPagePath);
  
  if (!fs.existsSync(testPageDir)) {
    fs.mkdirSync(testPageDir, { recursive: true });
  }
  
  fs.writeFileSync(testPagePath, testPageContent);
  console.log("✅ Logout test page created: /logout-test");
}

// Main menu
function showMenu() {
  console.log("\n📋 Logout Testing Options:");
  console.log("=".repeat(40));
  console.log("1. 🔍 Test Logout Functionality");
  console.log("2. 🐛 Debug Logout Issues");
  console.log("3. 📝 Generate Test Page");
  console.log("4. 🚀 Run All Tests");
  console.log("0. ❌ Exit");
  console.log("=".repeat(40));
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    const command = args[0];
    switch (command) {
      case 'test':
        testLogoutFunctionality();
        break;
      case 'debug':
        debugLogoutIssues();
        break;
      case 'generate':
        generateLogoutTestPage();
        break;
      case 'all':
        console.log("🚀 Running all logout tests...");
        testLogoutFunctionality();
        debugLogoutIssues();
        generateLogoutTestPage();
        console.log("✅ All logout tests completed!");
        break;
      default:
        console.log("❌ Unknown command. Available: test, debug, generate, all");
    }
  } else {
    showMenu();
    
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', async (data) => {
      const input = data.toString().trim();
      
      try {
        switch (input) {
          case '1':
            testLogoutFunctionality();
            break;
          case '2':
            debugLogoutIssues();
            break;
          case '3':
            generateLogoutTestPage();
            break;
          case '4':
            console.log("🚀 Running all logout tests...");
            testLogoutFunctionality();
            debugLogoutIssues();
            generateLogoutTestPage();
            console.log("✅ All logout tests completed!");
            break;
          case '0':
            console.log("👋 Goodbye!");
            process.exit(0);
            break;
          default:
            console.log("❌ Invalid option. Please choose 1-4 or 0 to exit.");
            showMenu();
        }
      } catch (error) {
        console.log("❌ Error:", error.message);
      }
    });
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log("\n👋 Goodbye!");
  process.exit(0);
});

// Start the application
main().catch(console.error);
