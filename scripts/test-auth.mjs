#!/usr/bin/env node

/**
 * Authentication Test Script
 * Kiểm tra toàn bộ hệ thống đăng nhập/đăng xuất
 */

// Use built-in fetch (Node.js 18+)
const fetch = globalThis.fetch;

const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
};

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

async function testHealthCheck() {
  log('\n🏥 Testing Health Check...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();
    
    if (response.ok) {
      log('✅ Health check passed', 'green');
      log(`   Status: ${data.status}`, 'blue');
      log(`   Database: ${data.services?.database}`, 'blue');
      log(`   Response time: ${data.responseTime}`, 'blue');
      return true;
    } else {
      log('❌ Health check failed', 'red');
      return false;
    }
  } catch (error) {
    log('❌ Health check error: ' + error.message, 'red');
    return false;
  }
}

async function testSessionAPI() {
  log('\n🔐 Testing Session API...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/session`);
    const data = await response.json();
    
    if (response.ok) {
      if (data.user) {
        log('✅ Session API - User authenticated', 'green');
        log(`   User: ${data.user.email}`, 'blue');
        log(`   Role: ${data.user.role}`, 'blue');
      } else {
        log('✅ Session API - No active session', 'yellow');
      }
      return true;
    } else {
      log('❌ Session API failed', 'red');
      log(`   Error: ${data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Session API error: ' + error.message, 'red');
    return false;
  }
}

async function testSignOutAPI() {
  log('\n🚪 Testing Sign Out API...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/signout`, {
      method: 'POST'
    });
    const data = await response.json();
    
    if (response.ok && data.success) {
      log('✅ Sign out API working', 'green');
      return true;
    } else {
      log('❌ Sign out API failed', 'red');
      return false;
    }
  } catch (error) {
    log('❌ Sign out API error: ' + error.message, 'red');
    return false;
  }
}

async function testOAuthEndpoints() {
  log('\n🔗 Testing OAuth Endpoints...', 'cyan');
  
  const oauthProviders = ['google', 'github'];
  let allWorking = true;
  
  for (const provider of oauthProviders) {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/oauth/${provider}`, {
        method: 'GET',
        redirect: 'manual'
      });
      
      if (response.status === 302 || response.status === 200) {
        log(`✅ ${provider.toUpperCase()} OAuth endpoint working`, 'green');
      } else {
        log(`⚠️  ${provider.toUpperCase()} OAuth endpoint returned status: ${response.status}`, 'yellow');
        allWorking = false;
      }
    } catch (error) {
      log(`❌ ${provider.toUpperCase()} OAuth error: ${error.message}`, 'red');
      allWorking = false;
    }
  }
  
  return allWorking;
}

async function testSignInPage() {
  log('\n📄 Testing Sign In Page...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/signin`);
    
    if (response.ok) {
      const html = await response.text();
      
      if (html.includes('Đăng nhập') && html.includes('email') && html.includes('password')) {
        log('✅ Sign in page loaded correctly', 'green');
        return true;
      } else {
        log('⚠️  Sign in page loaded but missing expected content', 'yellow');
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

async function testSimpleLoginPage() {
  log('\n📄 Testing Simple Login Page...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/simple-login`);
    
    if (response.ok) {
      const html = await response.text();
      
      if (html.includes('Đăng nhập') && html.includes('email') && html.includes('password')) {
        log('✅ Simple login page loaded correctly', 'green');
        return true;
      } else {
        log('⚠️  Simple login page loaded but missing expected content', 'yellow');
        return false;
      }
    } else {
      log('❌ Simple login page failed to load', 'red');
      return false;
    }
  } catch (error) {
    log('❌ Simple login page error: ' + error.message, 'red');
    return false;
  }
}

async function testRegisterPage() {
  log('\n📄 Testing Register Page...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/simple-register`);
    
    if (response.ok) {
      const html = await response.text();
      
      if (html.includes('Đăng ký') && html.includes('email') && html.includes('password')) {
        log('✅ Register page loaded correctly', 'green');
        return true;
      } else {
        log('⚠️  Register page loaded but missing expected content', 'yellow');
        return false;
      }
    } else {
      log('❌ Register page failed to load', 'red');
      return false;
    }
  } catch (error) {
    log('❌ Register page error: ' + error.message, 'red');
    return false;
  }
}

async function testAccountPage() {
  log('\n👤 Testing Account Page...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/account`);
    
    if (response.ok) {
      log('✅ Account page loaded', 'green');
      return true;
    } else if (response.status === 401 || response.status === 403) {
      log('✅ Account page properly protected (requires authentication)', 'green');
      return true;
    } else {
      log('⚠️  Account page returned unexpected status: ' + response.status, 'yellow');
      return false;
    }
  } catch (error) {
    log('❌ Account page error: ' + error.message, 'red');
    return false;
  }
}

async function runAllTests() {
  log('🚀 TravelGo Authentication Test Suite', 'bright');
  log('=====================================', 'bright');
  
  // Wait for server
  const serverReady = await waitForServer();
  if (!serverReady) {
    log('\n❌ Cannot proceed without server', 'red');
    process.exit(1);
  }
  
  // Run tests
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Session API', fn: testSessionAPI },
    { name: 'Sign Out API', fn: testSignOutAPI },
    { name: 'OAuth Endpoints', fn: testOAuthEndpoints },
    { name: 'Sign In Page', fn: testSignInPage },
    { name: 'Simple Login Page', fn: testSimpleLoginPage },
    { name: 'Register Page', fn: testRegisterPage },
    { name: 'Account Page', fn: testAccountPage },
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
    log('🎉 All authentication tests passed!', 'green');
  } else {
    log('⚠️  Some tests failed - check the output above', 'yellow');
  }
  
  log('\n🔧 Manual Testing Recommendations:', 'cyan');
  log('1. Visit http://localhost:3000/signin', 'blue');
  log('2. Try logging in with test credentials', 'blue');
  log('3. Test OAuth login (Google/GitHub)', 'blue');
  log('4. Test logout functionality', 'blue');
  log('5. Check account page access', 'blue');
}

// Run tests
runAllTests().catch(error => {
  log('❌ Test suite failed: ' + error.message, 'red');
  process.exit(1);
});
