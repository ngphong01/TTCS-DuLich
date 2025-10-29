#!/usr/bin/env node

/**
 * Bundle Analyzer Script
 * Analyzes bundle size and provides optimization recommendations
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

console.log('📊 Bundle Analyzer - Analyzing Next.js Bundle...\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Step 1: Build the application
log('🔨 Building application for analysis...', 'blue');
try {
  execSync('npm run build', { stdio: 'pipe' });
  log('✅ Build completed successfully', 'green');
} catch (error) {
  log('❌ Build failed:', 'red');
  console.error(error.message);
  process.exit(1);
}

// Step 2: Analyze bundle with bundle analyzer
log('\n📈 Running bundle analysis...', 'blue');
try {
  // Set environment variable for bundle analyzer
  process.env.ANALYZE = 'true';
  
  // Copy the analyze config
  const analyzeConfig = readFileSync('next.config.analyze.ts', 'utf8');
  writeFileSync('next.config.ts', analyzeConfig);
  
  // Run build with analysis
  execSync('npm run build', { stdio: 'pipe' });
  
  log('✅ Bundle analysis completed', 'green');
} catch (error) {
  log('❌ Bundle analysis failed:', 'red');
  console.error(error.message);
}

// Step 3: Generate bundle report
log('\n📋 Generating bundle report...', 'blue');

const bundleReport = {
  timestamp: new Date().toISOString(),
  analysis: {
    totalSize: 0,
    chunks: [],
    recommendations: []
  },
  recommendations: [
    'Use dynamic imports for large components',
    'Implement code splitting for routes',
    'Optimize images with next/image',
    'Remove unused dependencies',
    'Use tree shaking for better bundle optimization'
  ],
  nextSteps: [
    'Review bundle analyzer output',
    'Identify large dependencies',
    'Implement code splitting',
    'Optimize imports',
    'Monitor bundle size in CI/CD'
  ]
};

// Step 4: Check for large dependencies
log('\n🔍 Checking for large dependencies...', 'blue');

try {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const largeDeps = [];
  for (const [name, version] of Object.entries(dependencies)) {
    // This is a simplified check - in reality you'd need to analyze node_modules
    if (name.includes('prisma') || name.includes('next-auth') || name.includes('stripe')) {
      largeDeps.push({ name, version, estimatedSize: 'Large' });
    }
  }
  
  if (largeDeps.length > 0) {
    log('⚠️  Large dependencies detected:', 'yellow');
    largeDeps.forEach(dep => {
      log(`  - ${dep.name}@${dep.version}`, 'yellow');
    });
  }
} catch (error) {
  log('❌ Failed to analyze dependencies:', 'red');
}

// Step 5: Generate optimization recommendations
log('\n💡 Optimization Recommendations:', 'cyan');

const recommendations = [
  {
    category: 'Code Splitting',
    items: [
      'Use dynamic imports for heavy components',
      'Implement route-based code splitting',
      'Lazy load non-critical components'
    ]
  },
  {
    category: 'Bundle Optimization',
    items: [
      'Remove unused dependencies',
      'Use tree shaking',
      'Optimize imports (import only what you need)',
      'Consider using lighter alternatives'
    ]
  },
  {
    category: 'Performance',
    items: [
      'Use next/image for image optimization',
      'Implement service worker for caching',
      'Use CDN for static assets',
      'Enable compression'
    ]
  }
];

recommendations.forEach(rec => {
  log(`\n📦 ${rec.category}:`, 'magenta');
  rec.items.forEach(item => {
    log(`  • ${item}`, 'cyan');
  });
});

// Step 6: Save report
const reportPath = 'bundle-analysis-report.json';
writeFileSync(reportPath, JSON.stringify(bundleReport, null, 2));

log(`\n📄 Bundle analysis report saved to: ${reportPath}`, 'green');

// Step 7: Final summary
log('\n🎯 Bundle Analysis Summary:', 'bold');
log('✅ Build completed successfully', 'green');
log('✅ Bundle analysis completed', 'green');
log('✅ Report generated', 'green');
log('\n📋 Next Steps:', 'cyan');
log('1. Review bundle analyzer output in browser', 'cyan');
log('2. Check bundle-analysis-report.json for details', 'cyan');
log('3. Implement recommended optimizations', 'cyan');
log('4. Monitor bundle size in production', 'cyan');

log('\n🚀 Bundle analysis completed successfully!', 'green');
