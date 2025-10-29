#!/usr/bin/env node

/**
 * Password Reset Test Script
 * Kiểm tra toàn bộ flow reset password
 */

// Use built-in fetch (Node.js 18+)
const fetch = globalThis.fetch;

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'test@example.com';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function waitForServer(maxAttempts = 30) {
  log('🔄 Waiting for server to start...', 'cyan');
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      if (response.ok) {
        log('✅ Server is running!', 'green');
        return true;
      }
    } catch (error) {
      // Server not ready yet
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    process.stdout.write('.');
  }
  
  log('\n❌ Server failed to start', 'red');
  return false;
}

async function testForgotPasswordAPI() {
  log('\n📧 Testing Forgot Password API...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: TEST_EMAIL }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      log('✅ Forgot password API working', 'green');
      log(`   Message: ${data.message}`, 'blue');
      if (data.resetUrl) {
        log(`   Reset URL: ${data.resetUrl}`, 'blue');
      }
      return data.resetUrl || null;
    } else {
      log('❌ Forgot password API failed', 'red');
      log(`   Error: ${data.error}`, 'red');
      return null;
    }
  } catch (error) {
    log('❌ Forgot password API error: ' + error.message, 'red');
    return null;
  }
}

async function testResetPasswordAPI(resetToken) {
  log('\n🔐 Testing Reset Password API...', 'cyan');
  
  if (!resetToken) {
    log('⚠️  No reset token available, skipping reset test', 'yellow');
    return false;
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: resetToken,
        password: 'newpassword123',
      }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      log('✅ Reset password API working', 'green');
      log(`   Message: ${data.message}`, 'blue');
      return true;
    } else {
      log('❌ Reset password API failed', 'red');
      log(`   Error: ${data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Reset password API error: ' + error.message, 'red');
    return false;
  }
}

async function testForgotPasswordPage() {
  log('\n📄 Testing Forgot Password Page...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/forgot-password`);
    
    if (response.ok) {
      const html = await response.text();
      
      if (html.includes('Forgot Your Password') && html.includes('email')) {
        log('✅ Forgot password page loaded correctly', 'green');
        return true;
      } else {
        log('⚠️  Forgot password page loaded but missing expected content', 'yellow');
        return false;
      }
    } else {
      log('❌ Forgot password page failed to load', 'red');
      return false;
    }
  } catch (error) {
    log('❌ Forgot password page error: ' + error.message, 'red');
    return false;
  }
}

async function testResetPasswordPage() {
  log('\n📄 Testing Reset Password Page...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/reset-password`);
    
    if (response.ok) {
      const html = await response.text();
      
      if (html.includes('Reset Your Password') && html.includes('password')) {
        log('✅ Reset password page loaded correctly', 'green');
        return true;
      } else {
        log('⚠️  Reset password page loaded but missing expected content', 'yellow');
        return false;
      }
    } else {
      log('❌ Reset password page failed to load', 'red');
      return false;
    }
  } catch (error) {
    log('❌ Reset password page error: ' + error.message, 'red');
    return false;
  }
}

async function testResetSuccessPage() {
  log('\n📄 Testing Reset Success Page...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/reset-success`);
    
    if (response.ok) {
      const html = await response.text();
      
      if (html.includes('Password Reset Complete') && html.includes('successfully')) {
        log('✅ Reset success page loaded correctly', 'green');
        return true;
      } else {
        log('⚠️  Reset success page loaded but missing expected content', 'yellow');
        return false;
      }
    } else {
      log('❌ Reset success page failed to load', 'red');
      return false;
    }
  } catch (error) {
    log('❌ Reset success page error: ' + error.message, 'red');
    return false;
  }
}

async function testSignInPageWithForgotLink() {
  log('\n📄 Testing Sign In Page with Forgot Password Link...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/signin`);
    
    if (response.ok) {
      const html = await response.text();
      
      if (html.includes('Forgot your password') && html.includes('/forgot-password')) {
        log('✅ Sign in page has forgot password link', 'green');
        return true;
      } else {
        log('⚠️  Sign in page loaded but missing forgot password link', 'yellow');
        return false;
      }
    } else {
      log('❌ Sign in page failed to load', 'red');
      return false;
    }
  } catch (error) {
    log('❌ Sign in page error: ' + error.message, 'red');
    return false;
  }
}

async function runAllTests() {
  log('🚀 TravelGo Password Reset Test Suite', 'bright');
  log('====================================', 'bright');
  
  // Wait for server
  const serverReady = await waitForServer();
  if (!serverReady) {
    log('\n❌ Cannot proceed without server', 'red');
    process.exit(1);
  }
  
  // Test forgot password API
  const resetUrl = await testForgotPasswordAPI();
  const resetToken = resetUrl ? resetUrl.split('token=')[1] : null;
  
  // Test reset password API
  await testResetPasswordAPI(resetToken);
  
  // Test pages
  const tests = [
    { name: 'Forgot Password Page', fn: testForgotPasswordPage },
    { name: 'Reset Password Page', fn: testResetPasswordPage },
    { name: 'Reset Success Page', fn: testResetSuccessPage },
    { name: 'Sign In Page with Forgot Link', fn: testSignInPageWithForgotLink },
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const result = await test.fn();
    if (result) passed++;
  }
  
  // Summary
  log('\n📊 Test Summary', 'bright');
  log('================', 'bright');
  log(`✅ Passed: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('🎉 All password reset tests passed!', 'green');
  } else {
    log('⚠️  Some tests failed - check the output above', 'yellow');
  }
  
  log('\n🔧 Manual Testing Recommendations:', 'cyan');
  log('1. Visit http://localhost:3000/signin', 'blue');
  log('2. Click "Forgot your password?" link', 'blue');
  log('3. Enter email and submit', 'blue');
  log('4. Check console for reset link', 'blue');
  log('5. Visit reset link and test password reset', 'blue');
  log('6. Verify redirect to success page', 'blue');
}

// Run tests
runAllTests().catch(error => {
  log('❌ Test suite failed: ' + error.message, 'red');
  process.exit(1);
});
