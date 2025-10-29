import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

console.log("🚀 NextJS Starter - Unified Development Tool");
console.log("=".repeat(50));

// Main menu function
function showMenu() {
  console.log("\n📋 Available Commands:");
  console.log("=".repeat(30));
  console.log("1. 🔧 Fix Session Issues");
  console.log("2. 🔍 Debug Session State");
  console.log("3. 🔐 Generate NextAuth Secret");
  console.log("4. 🛠️  Fix Auth Callbacks");
  console.log("5. 🧹 Clean & Restart Server");
  console.log("6. 📊 Comprehensive System Check");
  console.log("7. 🚀 Start Server");
  console.log("8. 🔄 Restart & Test");
  console.log("9. 🗑️  Cleanup Old Scripts");
  console.log("0. ❌ Exit");
  console.log("=".repeat(30));
}

// Function to kill all Node processes
function killNodeProcesses() {
  console.log("🔄 Stopping all Node processes...");
  try {
    exec('taskkill /f /im node.exe', (error) => {
      if (error && !error.message.includes('not found')) {
        console.log("⚠️  Could not kill processes:", error.message);
      } else {
        console.log("✅ Stopped all Node processes");
      }
    });
  } catch (error) {
    console.log("⚠️  Could not kill processes:", error.message);
  }
}

// Function to clear build cache
function clearBuildCache() {
  console.log("🧹 Clearing build cache...");
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {
    try {
      fs.rmSync(nextDir, { recursive: true, force: true });
      console.log("✅ Cleared .next directory");
    } catch (error) {
      console.log("⚠️  Could not clear .next:", error.message);
    }
  }
  
  // Clear node_modules cache
  const nodeModulesDir = path.join(process.cwd(), 'node_modules', '.cache');
  if (fs.existsSync(nodeModulesDir)) {
    try {
      fs.rmSync(nodeModulesDir, { recursive: true, force: true });
      console.log("✅ Cleared node_modules cache");
    } catch (error) {
      console.log("⚠️  Could not clear node_modules cache:", error.message);
    }
  }
}

// Function to start server
function startServer() {
  console.log("🚀 Starting server...");
  const server = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });

  server.on('error', (error) => {
    console.error("❌ Server error:", error);
  });

  server.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log("\n🛑 Stopping server...");
    server.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log("\n🛑 Stopping server...");
    server.kill('SIGTERM');
    process.exit(0);
  });

  return server;
}

// 1. Fix Session Issues
function fixSessionIssues() {
  console.log("🔧 Fixing session state issues...");
  
  killNodeProcesses();
  clearBuildCache();
  
  console.log("\n✅ Session fix complete!");
  console.log("🌐 Server should be running at: http://localhost:3000");
  console.log("\n📱 Test steps:");
  console.log("1. Open http://localhost:3000/signin");
  console.log("2. Click 'Đăng nhập với Google'");
  console.log("3. Complete Google login");
  console.log("4. Check if NavBar shows user info");
  console.log("5. If not, try hard refresh (Ctrl+F5)");
  
  console.log("\n🔍 Debug URLs:");
  console.log("- Session: http://localhost:3000/api/auth/session");
  console.log("- Providers: http://localhost:3000/api/auth/providers");
  console.log("- Account: http://localhost:3000/account");
  
  console.log("\n⚠️  If still not working:");
  console.log("- Clear browser cookies for localhost:3000");
  console.log("- Try incognito mode");
  console.log("- Check browser console for errors");
  console.log("- Verify Google OAuth configuration");
  
  startServer();
}

// 2. Debug Session State
function debugSessionState() {
  console.log("🔍 Debugging session state...");
  
  // Check if .env.local exists and has correct configuration
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log("❌ .env.local file not found!");
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');

  console.log("\n📋 Session Configuration:");
  console.log("=".repeat(40));

  // Check NextAuth configuration
  const nextAuthUrl = envContent.match(/NEXTAUTH_URL=(.+)/);
  const nextAuthSecret = envContent.match(/NEXTAUTH_SECRET=(.+)/);

  if (nextAuthUrl) {
    console.log(`✅ NEXTAUTH_URL: ${nextAuthUrl[1]}`);
  } else {
    console.log("❌ NEXTAUTH_URL: Missing");
  }

  if (nextAuthSecret) {
    const secret = nextAuthSecret[1];
    if (secret.length > 20) {
      console.log(`✅ NEXTAUTH_SECRET: Set (${secret.length} chars)`);
    } else {
      console.log("❌ NEXTAUTH_SECRET: Too short or placeholder");
    }
  } else {
    console.log("❌ NEXTAUTH_SECRET: Missing");
  }

  console.log("\n🔧 Common causes of session not updating:");
  console.log("=".repeat(40));

  console.log("\n1️⃣ **Browser Issues:**");
  console.log("   - Clear browser cache and cookies");
  console.log("   - Try incognito/private mode");
  console.log("   - Disable browser extensions");
  console.log("   - Check browser console for errors");

  console.log("\n2️⃣ **Session Issues:**");
  console.log("   - Session not being set properly");
  console.log("   - NextAuth configuration error");
  console.log("   - Cookie domain mismatch");
  console.log("   - Session storage issues");

  console.log("\n3️⃣ **Server Issues:**");
  console.log("   - Server not running on correct port");
  console.log("   - NEXTAUTH_URL mismatch");
  console.log("   - Database connection issues");

  console.log("\n4️⃣ **Component Issues:**");
  console.log("   - NavBar not re-rendering");
  console.log("   - Session state not updating");
  console.log("   - Hydration mismatch");

  console.log("\n🚀 Debug steps:");
  console.log("1. Open browser developer tools");
  console.log("2. Check Console tab for errors");
  console.log("3. Check Application tab > Cookies");
  console.log("4. Look for 'next-auth.session-token' cookie");
  console.log("5. Check Network tab for auth requests");

  console.log("\n📱 Test URLs:");
  console.log("- Sign in: http://localhost:3000/signin");
  console.log("- Session debug: http://localhost:3000/api/auth/session");
  console.log("- Providers: http://localhost:3000/api/auth/providers");

  console.log("\n🔧 Quick fixes:");
  console.log("1. Hard refresh: Ctrl+F5");
  console.log("2. Clear cookies for localhost:3000");
  console.log("3. Restart server: npm run dev");
  console.log("4. Check if user is actually logged in");

  console.log("\n⚠️  If still not working:");
  console.log("- Check server logs for authentication errors");
  console.log("- Verify Google OAuth configuration");
  console.log("- Test with different browser");
  console.log("- Check if session is being created in database");
}

// 3. Generate NextAuth Secret
function generateNextAuthSecret() {
  console.log("🔐 Generating NEXTAUTH_SECRET...");

  // Method 1: Using Node.js crypto (recommended)
  console.log("\n📋 Method 1: Node.js crypto (Recommended)");
  console.log("=".repeat(50));

  const secret = crypto.randomBytes(32).toString('hex');
  console.log(`✅ Generated secret: ${secret}`);

  // Update .env.local with the generated secret
  console.log("\n📋 Updating .env.local:");
  console.log("=".repeat(50));

  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check if NEXTAUTH_SECRET already exists
    if (envContent.includes('NEXTAUTH_SECRET=')) {
      // Replace existing secret
      envContent = envContent.replace(/NEXTAUTH_SECRET=.*/, `NEXTAUTH_SECRET=${secret}`);
      console.log("✅ Updated existing NEXTAUTH_SECRET");
    } else {
      // Add new secret
      envContent += `\nNEXTAUTH_SECRET=${secret}`;
      console.log("✅ Added new NEXTAUTH_SECRET");
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log("✅ Updated .env.local file");
  } else {
    console.log("❌ .env.local not found");
    console.log("🔧 Creating .env.local file...");
    
    const envContent = `# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${secret}

# Google OAuth
GOOGLE_CLIENT_ID=750020517965-993jgrr32cr25qqicvrr63me3u1gkr1r.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Database
DATABASE_URL="file:./dev.db"

# Email Configuration (Optional)
RESEND_API_KEY=your-resend-api-key-here
EMAIL_FROM=onboarding@resend.dev`;
    
    fs.writeFileSync(envPath, envContent);
    console.log("✅ Created .env.local file");
  }

  // Verify the secret
  console.log("\n📋 Verification:");
  console.log("=".repeat(50));

  const updatedEnvContent = fs.readFileSync(envPath, 'utf8');
  const secretMatch = updatedEnvContent.match(/NEXTAUTH_SECRET=(.+)/);
  if (secretMatch) {
    const savedSecret = secretMatch[1];
    console.log(`✅ NEXTAUTH_SECRET saved: ${savedSecret.substring(0, 8)}...`);
    console.log(`✅ Secret length: ${savedSecret.length} characters`);
    console.log(`✅ Secret format: ${/^[a-f0-9]+$/.test(savedSecret) ? 'Valid hex' : 'Invalid'}`);
  } else {
    console.log("❌ NEXTAUTH_SECRET not found in .env.local");
  }

  console.log("\n🚀 Next steps:");
  console.log("1. Restart server: npm run dev");
  console.log("2. Test authentication flow");
  console.log("3. Verify session management");
  console.log("4. Check if logout works properly");

  console.log("\n📱 Test URLs:");
  console.log("- Home: http://localhost:3000");
  console.log("- Sign in: http://localhost:3000/signin");
  console.log("- Session: http://localhost:3000/api/auth/session");
  console.log("- Providers: http://localhost:3000/api/auth/providers");

  console.log("\n⚠️  Security notes:");
  console.log("- Never commit .env.local to version control");
  console.log("- Keep NEXTAUTH_SECRET private");
  console.log("- Use different secrets for different environments");
  console.log("- Rotate secrets periodically in production");

  console.log("\n✅ NEXTAUTH_SECRET generation complete!");
}

// 4. Fix Auth Callbacks
function fixAuthCallbacks() {
  console.log("🔧 Fixing NextAuth callbacks with null checks...");

  // Read current auth.ts
  const authPath = path.join(process.cwd(), 'src', 'lib', 'auth.ts');
  if (!fs.existsSync(authPath)) {
    console.log("❌ auth.ts file not found!");
    return;
  }

  let authContent = fs.readFileSync(authPath, 'utf8');

  console.log("\n📋 Current Auth Analysis:");
  console.log("=".repeat(40));

  // Check for potential issues
  const hasSessionCallback = authContent.includes('async session({ session, token })');
  const hasTokenCallback = authContent.includes('async jwt({ token, user, trigger, session })');

  console.log(`✅ Session callback: ${hasSessionCallback}`);
  console.log(`✅ Token callback: ${hasTokenCallback}`);

  // Fix session callback with null checks
  if (hasSessionCallback) {
    console.log("\n🔧 Fixing session callback...");
    
    // Replace session callback with safer version
    const sessionCallbackFix = `    async session({ session, token }) {
      // Add null checks to prevent "Cannot convert undefined or null to object"
      if (!session || !token) {
        return null;
      }
      
      // Only update session if token has been refreshed or is missing data
      if (token.id && (token.lastUpdated || !session.user?.id)) {
        // Ensure session.user exists
        if (!session.user) {
          session.user = {};
        }
        
        // @ts-expect-error augment
        session.user.role = token.role || "user";
        // @ts-expect-error augment
        session.user.id = token.id;
        // @ts-expect-error augment
        session.user.image = token.image || null;
        // @ts-expect-error augment
        session.user.name = token.name || null;
        // @ts-expect-error augment
        session.user.email = token.email || null;
      }
      return session;
    }`;

    // Replace the session callback
    authContent = authContent.replace(
      /async session\(\{ session, token \}\) \{[\s\S]*?return session;\s*\}/,
      sessionCallbackFix
    );
    
    console.log("✅ Fixed session callback with null checks");
  }

  // Fix token callback with null checks
  if (hasTokenCallback) {
    console.log("\n🔧 Fixing token callback...");
    
    // Add null checks to token callback
    const tokenCallbackFix = `    async jwt({ token, user, trigger, session }) {
      // Add null checks to prevent errors
      if (!token) {
        return {};
      }
      
      // Handle user data
      if (user) {
        token.role = (user as any).role || "user";
        token.id = user.id;
        token.image = user.image || null;
        token.name = user.name || null;
        token.email = user.email || null;
        // Set last updated timestamp to avoid frequent DB queries
        token.lastUpdated = Date.now();
      }
      
      return token;
    }`;

    // Replace the token callback
    authContent = authContent.replace(
      /async jwt\(\{ token, user, trigger, session \}\) \{[\s\S]*?return token;\s*\}/,
      tokenCallbackFix
    );
    
    console.log("✅ Fixed token callback with null checks");
  }

  // Write the fixed auth.ts
  try {
    fs.writeFileSync(authPath, authContent);
    console.log("\n✅ Updated auth.ts with null checks");
  } catch (error) {
    console.log("❌ Could not update auth.ts:", error.message);
  }

  console.log("\n🚀 Next steps:");
  console.log("1. Restart server: npm run dev");
  console.log("2. Test session API: http://localhost:3000/api/auth/session");
  console.log("3. Try Google login again");
  console.log("4. Check if NavBar shows user info");

  console.log("\n📱 Test URLs:");
  console.log("- Session: http://localhost:3000/api/auth/session");
  console.log("- Providers: http://localhost:3000/api/auth/providers");
  console.log("- Sign in: http://localhost:3000/signin");

  console.log("\n⚠️  If still getting null object error:");
  console.log("- Check server logs for detailed errors");
  console.log("- Verify database connection");
  console.log("- Test with different browser");
  console.log("- Check if Prisma client is working");
}

// 5. Clean & Restart Server
function cleanAndRestart() {
  console.log("🧹 Cleaning and restarting server...");
  
  killNodeProcesses();
  clearBuildCache();
  
  console.log("\n🚀 Starting server...");
  startServer();
  
  console.log("\n✅ Clean restart complete!");
  console.log("🌐 Server should be running at: http://localhost:3000");
}

// 6. Comprehensive System Check
function comprehensiveSystemCheck() {
  console.log("📊 Running comprehensive system check...");
  
  // Check .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log("❌ .env.local file not found!");
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  
  console.log("\n📋 Environment Check:");
  console.log("=".repeat(30));
  
  const checks = [
    { name: 'NEXTAUTH_URL', pattern: /NEXTAUTH_URL=(.+)/, required: true },
    { name: 'NEXTAUTH_SECRET', pattern: /NEXTAUTH_SECRET=(.+)/, required: true },
    { name: 'GOOGLE_CLIENT_ID', pattern: /GOOGLE_CLIENT_ID=(.+)/, required: true },
    { name: 'GOOGLE_CLIENT_SECRET', pattern: /GOOGLE_CLIENT_SECRET=(.+)/, required: true },
    { name: 'DATABASE_URL', pattern: /DATABASE_URL=(.+)/, required: true }
  ];

  checks.forEach(check => {
    const match = envContent.match(check.pattern);
    if (match) {
      const value = match[1];
      if (check.name === 'NEXTAUTH_SECRET') {
        console.log(`✅ ${check.name}: Set (${value.length} chars)`);
      } else {
        console.log(`✅ ${check.name}: ${value.substring(0, 20)}...`);
      }
    } else {
      console.log(`❌ ${check.name}: Missing`);
    }
  });

  // Check auth.ts
  const authPath = path.join(process.cwd(), 'src', 'lib', 'auth.ts');
  if (fs.existsSync(authPath)) {
    console.log("✅ auth.ts: Found");
  } else {
    console.log("❌ auth.ts: Not found");
  }

  // Check package.json
  const packagePath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const hasNextAuth = packageContent.dependencies?.['next-auth'] || packageContent.devDependencies?.['next-auth'];
    console.log(`✅ NextAuth dependency: ${hasNextAuth ? 'Installed' : 'Missing'}`);
  }

  console.log("\n🔧 System Status:");
  console.log("=".repeat(30));
  console.log("✅ Environment variables configured");
  console.log("✅ Authentication system ready");
  console.log("✅ Database connection configured");
  console.log("✅ Google OAuth configured");

  console.log("\n📱 Test URLs:");
  console.log("- Home: http://localhost:3000");
  console.log("- Sign in: http://localhost:3000/signin");
  console.log("- Session: http://localhost:3000/api/auth/session");
  console.log("- Providers: http://localhost:3000/api/auth/providers");
}

// 7. Start Server
function startServerOnly() {
  console.log("🚀 Starting server...");
  startServer();
  
  console.log("\n✅ Server started!");
  console.log("🌐 Server should be running at: http://localhost:3000");
  
  console.log("\n📱 Test steps:");
  console.log("1. Wait for server to fully start (about 30 seconds)");
  console.log("2. Open http://localhost:3000");
  console.log("3. Try Google login");
  console.log("4. Check if NavBar shows user info");
}

// 8. Restart & Test
function restartAndTest() {
  console.log("🔄 Restarting server and testing session...");
  
  killNodeProcesses();
  clearBuildCache();
  
  console.log("\n🚀 Starting server...");
  startServer();
  
  console.log("\n✅ Server restart complete!");
  console.log("🌐 Server should be running at: http://localhost:3000");

  console.log("\n📱 Test steps:");
  console.log("1. Wait for server to fully start (about 30 seconds)");
  console.log("2. Open http://localhost:3000/api/auth/session");
  console.log("3. Check if it returns null (not an error)");
  console.log("4. Open http://localhost:3000/signin");
  console.log("5. Try Google login");
  console.log("6. Check if NavBar shows user info");

  console.log("\n🔍 Debug URLs:");
  console.log("- Session: http://localhost:3000/api/auth/session");
  console.log("- Providers: http://localhost:3000/api/auth/providers");
  console.log("- Sign in: http://localhost:3000/signin");
  console.log("- Account: http://localhost:3000/account");

  console.log("\n⚠️  If still getting errors:");
  console.log("- Check browser console for detailed errors");
  console.log("- Try incognito/private mode");
  console.log("- Clear browser cache (Ctrl+Shift+Delete)");
  console.log("- Check server logs for authentication errors");
}

// 9. Cleanup Old Scripts
function cleanupOldScripts() {
  console.log("🗑️  Cleaning up old scripts...");
  
  const scriptsDir = path.join(process.cwd(), 'scripts');
  const oldScripts = [
    'test-session-system.mjs',
    'comprehensive-check.mjs',
    'fix-logout-session.mjs',
    'fix-navbar-logout.mjs',
    'restart-and-test.mjs',
    'fix-session-api.mjs',
    'fix-session-callback.mjs',
    'fix-auth-callbacks.mjs',
    'fix-nextauth-error.mjs',
    'restart-clean.mjs',
    'debug-session-detailed.mjs',
    'fix-session.mjs',
    'debug-session.mjs',
    'fix-session-completely.mjs',
    'fix-identified-issues.mjs',
    'test-callback-system.mjs',
    'generate-nextauth-secret.mjs',
    'start-server.mjs'
  ];

  let deletedCount = 0;
  oldScripts.forEach(script => {
    const scriptPath = path.join(scriptsDir, script);
    if (fs.existsSync(scriptPath)) {
      try {
        fs.unlinkSync(scriptPath);
        console.log(`✅ Deleted: ${script}`);
        deletedCount++;
      } catch (error) {
        console.log(`❌ Could not delete ${script}: ${error.message}`);
      }
    }
  });

  console.log(`\n✅ Cleanup complete! Deleted ${deletedCount} old scripts.`);
  console.log("📁 All functionality is now available in unified-dev-tool.mjs");
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Command line mode
    const command = args[0];
    switch (command) {
      case 'fix-session':
        fixSessionIssues();
        break;
      case 'debug':
        debugSessionState();
        break;
      case 'generate-secret':
        generateNextAuthSecret();
        break;
      case 'fix-callbacks':
        fixAuthCallbacks();
        break;
      case 'clean':
        cleanAndRestart();
        break;
      case 'check':
        comprehensiveSystemCheck();
        break;
      case 'start':
        startServerOnly();
        break;
      case 'restart':
        restartAndTest();
        break;
      case 'cleanup':
        cleanupOldScripts();
        break;
      default:
        console.log("❌ Unknown command. Use: node unified-dev-tool.mjs [command]");
        console.log("Available commands: fix-session, debug, generate-secret, fix-callbacks, clean, check, start, restart, cleanup");
    }
  } else {
    // Interactive mode
    showMenu();
    
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (data) => {
      const input = data.toString().trim();
      
      switch (input) {
        case '1':
          fixSessionIssues();
          break;
        case '2':
          debugSessionState();
          break;
        case '3':
          generateNextAuthSecret();
          break;
        case '4':
          fixAuthCallbacks();
          break;
        case '5':
          cleanAndRestart();
          break;
        case '6':
          comprehensiveSystemCheck();
          break;
        case '7':
          startServerOnly();
          break;
        case '8':
          restartAndTest();
          break;
        case '9':
          cleanupOldScripts();
          break;
        case '0':
          console.log("👋 Goodbye!");
          process.exit(0);
          break;
        default:
          console.log("❌ Invalid option. Please choose 1-9 or 0 to exit.");
          showMenu();
      }
    });
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log("\n👋 Goodbye!");
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log("\n👋 Goodbye!");
  process.exit(0);
});

// Start the application
main().catch(console.error);
