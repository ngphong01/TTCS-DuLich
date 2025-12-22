// Script to test OAuth configuration
require('dotenv').config();

async function testOAuth() {
  console.log('🔍 Testing OAuth Configuration...\n');

  // Check Google OAuth
  console.log('1️⃣  Google OAuth:');
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleRedirect = process.env.OAUTH_GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google';

  if (googleClientId && googleClientSecret) {
    console.log('   ✅ Client ID: Set');
    console.log('   ✅ Client Secret: Set');
    console.log(`   📍 Redirect URI: ${googleRedirect}`);
    
    // Check if redirect URI matches common patterns
    if (googleRedirect.includes('localhost:3000') || googleRedirect.includes('127.0.0.1:3000')) {
      console.log('   ⚠️  Using localhost - ensure this matches Google Console settings');
    }
  } else {
    console.log('   ❌ Not configured');
    console.log('   💡 Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
  }
  console.log('');

  // Check Facebook OAuth
  console.log('2️⃣  Facebook OAuth:');
  const facebookAppId = process.env.FACEBOOK_APP_ID;
  const facebookAppSecret = process.env.FACEBOOK_APP_SECRET;
  const facebookRedirect = process.env.OAUTH_FACEBOOK_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/facebook';

  if (facebookAppId && facebookAppSecret) {
    console.log('   ✅ App ID: Set');
    console.log('   ✅ App Secret: Set');
    console.log(`   📍 Redirect URI: ${facebookRedirect}`);
  } else {
    console.log('   ⚠️  Not configured (optional)');
    console.log('   💡 Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in .env if needed');
  }
  console.log('');

  // Check OAuth endpoints
  console.log('3️⃣  OAuth Endpoints:');
  console.log('   🔗 Google Auth: /api/auth/google');
  console.log('   🔗 Google Callback: /api/auth/callback/google');
  console.log('   🔗 Facebook Auth: /api/auth/facebook');
  console.log('   🔗 Facebook Callback: /api/auth/callback/facebook');
  console.log('');

  // Summary
  if (googleClientId && googleClientSecret) {
    console.log('✅ OAuth is configured and ready!');
    console.log('\n💡 To test:');
    console.log('   1. Start the server: npm start');
    console.log('   2. Visit: http://localhost:3000/api/auth/google');
    console.log('   3. Complete OAuth flow');
  } else {
    console.log('⚠️  OAuth not fully configured');
  }
}

testOAuth();

