#!/usr/bin/env node

/**
 * Comprehensive System Check Script
 * Kiểm tra toàn bộ hệ thống TravelGo
 */

// Use built-in fetch (Node.js 18+)
const fetch = globalThis.fetch;

const BASE_URL = 'http://127.0.0.1:3000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`🔍 ${title}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logResult(testName, status, details = '') {
  const icon = status ? '✅' : '❌';
  const color = status ? 'green' : 'red';
  log(`${icon} ${testName}`, color);
  if (details) {
    log(`   ${details}`, 'blue');
  }
}

async function checkServerHealth() {
  logSection('SERVER HEALTH CHECK');
  
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();
    
    logResult('Server Status', response.ok, `Status: ${data.status}`);
    logResult('API Health', data.services?.api === 'healthy', 'API endpoints responding');
    logResult('Uptime', true, `Running for ${data.uptime}`);
    logResult('Response Time', data.responseTime < 100, `${data.responseTime}ms`);
    logResult('Memory Usage', true, `${data.memory?.used}/${data.memory?.total} MB`);
    
    // Database status
    logResult('Database Connection', data.services?.database === 'healthy', 
      data.services?.database === 'healthy' ? 'Connected' : 'Connection failed');
    
    // Features status
    logResult('OAuth Integration', data.features?.oauth === 'enabled', 'Google/GitHub OAuth ready');
    logResult('Stripe Payment', data.features?.stripe === 'enabled', 'Payment processing');
    logResult('Email Service', data.features?.email === 'enabled', 'Email notifications');
    logResult('Redis Cache', data.features?.redis === 'enabled', 'Caching layer');
    logResult('Monitoring', data.features?.monitoring === 'enabled', 'Analytics & monitoring');
    
    return data;
  } catch (error) {
    logResult('Server Health', false, `Error: ${error.message}`);
    return null;
  }
}

async function checkAuthenticationSystem() {
  logSection('AUTHENTICATION SYSTEM');
  
  const authTests = [
    { name: 'Session API', endpoint: '/api/auth/session', method: 'GET' },
    { name: 'Sign Out API', endpoint: '/api/auth/signout', method: 'POST' },
    { name: 'Google OAuth', endpoint: '/api/auth/oauth/google', method: 'GET' },
    { name: 'GitHub OAuth', endpoint: '/api/auth/oauth/github', method: 'GET' },
    { name: 'Simple Register', endpoint: '/api/auth/simple-register', method: 'POST' },
    { name: 'Simple Sign In', endpoint: '/api/auth/simple-signin', method: 'POST' },
  ];
  
  let passed = 0;
  
  for (const test of authTests) {
    try {
      const response = await fetch(`${BASE_URL}${test.endpoint}`, {
        method: test.method,
        headers: test.method === 'POST' ? { 'Content-Type': 'application/json' } : {},
        body: test.method === 'POST' ? JSON.stringify({}) : undefined,
      });
      
      const isWorking = response.ok || response.status === 400 || response.status === 401;
      logResult(test.name, isWorking, `Status: ${response.status}`);
      if (isWorking) passed++;
    } catch (error) {
      logResult(test.name, false, `Error: ${error.message}`);
    }
  }
  
  log(`\n📊 Authentication Tests: ${passed}/${authTests.length} passed`, 
    passed === authTests.length ? 'green' : 'yellow');
}

async function checkPasswordResetSystem() {
  logSection('PASSWORD RESET SYSTEM');
  
  const resetTests = [
    { name: 'Forgot Password API', endpoint: '/api/auth/forgot-password', method: 'POST' },
    { name: 'Reset Password API', endpoint: '/api/auth/forgot-password', method: 'PUT' },
  ];
  
  let passed = 0;
  
  for (const test of resetTests) {
    try {
      const response = await fetch(`${BASE_URL}${test.endpoint}`, {
        method: test.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      
      const isWorking = response.ok || response.status === 400;
      logResult(test.name, isWorking, `Status: ${response.status}`);
      if (isWorking) passed++;
    } catch (error) {
      logResult(test.name, false, `Error: ${error.message}`);
    }
  }
  
  log(`\n📊 Password Reset Tests: ${passed}/${resetTests.length} passed`, 
    passed === resetTests.length ? 'green' : 'yellow');
}

async function checkFrontendPages() {
  logSection('FRONTEND PAGES');
  
  const pages = [
    { name: 'Home Page', path: '/' },
    { name: 'Sign In Page', path: '/signin' },
    { name: 'Simple Login', path: '/simple-login' },
    { name: 'Simple Register', path: '/simple-register' },
    { name: 'Forgot Password', path: '/forgot-password' },
    { name: 'Reset Password', path: '/reset-password' },
    { name: 'Reset Success', path: '/reset-success' },
    { name: 'Account Page', path: '/account' },
    { name: 'Destinations', path: '/destinations' },
    { name: 'About Page', path: '/about' },
    { name: 'Contact Page', path: '/contact' },
  ];
  
  let passed = 0;
  
  for (const page of pages) {
    try {
      const response = await fetch(`${BASE_URL}${page.path}`);
      
      const isWorking = response.ok;
      const statusText = response.status === 401 ? 'Protected (requires auth)' : 
                        response.status === 200 ? 'Accessible' : `Status: ${response.status}`;
      
      logResult(page.name, isWorking, statusText);
      if (isWorking || response.status === 401) passed++;
    } catch (error) {
      logResult(page.name, false, `Error: ${error.message}`);
    }
  }
  
  log(`\n📊 Frontend Pages: ${passed}/${pages.length} accessible`, 
    passed === pages.length ? 'green' : 'yellow');
}

async function checkAPIEndpoints() {
  logSection('API ENDPOINTS');
  
  const apis = [
    { name: 'Health Check', endpoint: '/api/health', method: 'GET' },
    { name: 'Analytics', endpoint: '/api/analytics', method: 'GET' },
    { name: 'Destinations', endpoint: '/api/destinations', method: 'GET' },
    { name: 'Chat Messages', endpoint: '/api/chat/messages', method: 'GET' },
  ];
  
  let passed = 0;
  
  for (const api of apis) {
    try {
      const response = await fetch(`${BASE_URL}${api.endpoint}`, {
        method: api.method,
      });
      
      const isWorking = response.ok || response.status === 400;
      logResult(api.name, isWorking, `Status: ${response.status}`);
      if (isWorking) passed++;
    } catch (error) {
      logResult(api.name, false, `Error: ${error.message}`);
    }
  }
  
  log(`\n📊 API Endpoints: ${passed}/${apis.length} working`, 
    passed === apis.length ? 'green' : 'yellow');
}

async function checkSecurityFeatures() {
  logSection('SECURITY FEATURES');
  
  try {
    // Check security headers
    const response = await fetch(`${BASE_URL}/`);
    const headers = response.headers;
    
    const securityHeaders = [
      { name: 'X-Frame-Options', header: 'x-frame-options' },
      { name: 'X-Content-Type-Options', header: 'x-content-type-options' },
      { name: 'Referrer-Policy', header: 'referrer-policy' },
      { name: 'X-DNS-Prefetch-Control', header: 'x-dns-prefetch-control' },
      { name: 'X-XSS-Protection', header: 'x-xss-protection' },
      { name: 'Content-Security-Policy', header: 'content-security-policy' },
    ];
    
    let passed = 0;
    
    for (const security of securityHeaders) {
      const hasHeader = headers.get(security.header);
      logResult(security.name, !!hasHeader, hasHeader ? hasHeader : 'Not set');
      if (hasHeader) passed++;
    }
    
    log(`\n📊 Security Headers: ${passed}/${securityHeaders.length} configured`, 
      passed >= 4 ? 'green' : 'yellow');
      
  } catch (error) {
    logResult('Security Headers', false, `Error: ${error.message}`);
  }
}

async function checkPerformanceMetrics() {
  logSection('PERFORMANCE METRICS');
  
  const tests = [
    { name: 'Home Page Load', endpoint: '/' },
    { name: 'Sign In Page Load', endpoint: '/signin' },
    { name: 'API Health Response', endpoint: '/api/health' },
    { name: 'Destinations API', endpoint: '/api/destinations' },
  ];
  
  let totalTime = 0;
  let passed = 0;
  
  for (const test of tests) {
    try {
      const start = Date.now();
      const response = await fetch(`${BASE_URL}${test.endpoint}`);
      const end = Date.now();
      const duration = end - start;
      
      const isFast = duration < 500; // Less than 500ms
      logResult(test.name, isFast, `${duration}ms`);
      
      totalTime += duration;
      if (isFast) passed++;
    } catch (error) {
      logResult(test.name, false, `Error: ${error.message}`);
    }
  }
  
  const avgTime = totalTime / tests.length;
  log(`\n📊 Performance: ${passed}/${tests.length} fast responses`, 
    passed >= 3 ? 'green' : 'yellow');
  log(`   Average response time: ${avgTime.toFixed(0)}ms`, 'blue');
}

async function generateSystemReport(healthData) {
  logSection('SYSTEM REPORT SUMMARY');
  
  const report = {
    timestamp: new Date().toISOString(),
    server: {
      status: healthData?.status || 'unknown',
      uptime: healthData?.uptime || 'unknown',
      responseTime: healthData?.responseTime || 'unknown',
      memory: healthData?.memory || {},
    },
    services: {
      database: healthData?.services?.database || 'unknown',
      api: healthData?.services?.api || 'unknown',
    },
    features: healthData?.features || {},
    environment: healthData?.environment || 'unknown',
    version: healthData?.version || 'unknown',
  };
  
  log('📋 System Status Overview:', 'bright');
  log(`   Environment: ${report.environment}`, 'blue');
  log(`   Version: ${report.version}`, 'blue');
  log(`   Server Status: ${report.server.status}`, 
    report.server.status === 'healthy' ? 'green' : 'red');
  log(`   Uptime: ${report.server.uptime}`, 'blue');
  log(`   Response Time: ${report.server.responseTime}`, 'blue');
  log(`   Memory Usage: ${report.server.memory.used}/${report.server.memory.total} MB`, 'blue');
  
  log('\n🔧 Service Status:', 'bright');
  log(`   Database: ${report.services.database}`, 
    report.services.database === 'healthy' ? 'green' : 'red');
  log(`   API: ${report.services.api}`, 
    report.services.api === 'healthy' ? 'green' : 'green');
  
  log('\n⚡ Features Status:', 'bright');
  Object.entries(report.features).forEach(([feature, status]) => {
    const icon = status === 'enabled' ? '✅' : '❌';
    const color = status === 'enabled' ? 'green' : 'red';
    log(`   ${feature}: ${icon} ${status}`, color);
  });
  
  // Overall score
  const score = calculateSystemScore(report);
  log(`\n🎯 Overall System Score: ${score}/10`, 
    score >= 8 ? 'green' : score >= 6 ? 'yellow' : 'red');
}

function calculateSystemScore(report) {
  let score = 0;
  
  // Server health (3 points)
  if (report.server.status === 'healthy') score += 3;
  else if (report.server.status === 'unhealthy') score += 1;
  
  // Database (2 points)
  if (report.services.database === 'healthy') score += 2;
  else if (report.services.database === 'unhealthy') score += 0.5;
  
  // API (2 points)
  if (report.services.api === 'healthy') score += 2;
  
  // Features (3 points)
  const enabledFeatures = Object.values(report.features).filter(f => f === 'enabled').length;
  score += (enabledFeatures / Object.keys(report.features).length) * 3;
  
  return Math.round(score * 10) / 10;
}

async function runComprehensiveCheck() {
  log('🚀 TravelGo Comprehensive System Check', 'bright');
  log('=====================================', 'bright');
  
  // Run all checks
  const healthData = await checkServerHealth();
  await checkAuthenticationSystem();
  await checkPasswordResetSystem();
  await checkFrontendPages();
  await checkAPIEndpoints();
  await checkSecurityFeatures();
  await checkPerformanceMetrics();
  
  // Generate final report
  await generateSystemReport(healthData);
  
  log('\n🎉 System check completed!', 'green');
  log('For detailed logs, check the server console.', 'blue');
}

// Run the comprehensive check
runComprehensiveCheck().catch(error => {
  log('❌ System check failed: ' + error.message, 'red');
  process.exit(1);
});
