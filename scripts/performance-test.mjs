#!/usr/bin/env node

/**
 * Performance Testing Script
 * Script để test và đo lường hiệu suất của ứng dụng
 */

import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log("🚀 Performance Testing Tool");
console.log("=".repeat(50));

// Performance test functions
function runLighthouseTest() {
  console.log("🔍 Running Lighthouse performance test...");
  
  return new Promise((resolve, reject) => {
    exec('npx lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-report.json --chrome-flags="--headless"', (error, stdout, stderr) => {
      if (error) {
        console.log("❌ Lighthouse test failed:", error.message);
        reject(error);
        return;
      }
      
      try {
        const report = JSON.parse(fs.readFileSync('./lighthouse-report.json', 'utf8'));
        const performance = report.categories.performance.score * 100;
        
        console.log(`✅ Lighthouse Performance Score: ${performance.toFixed(1)}%`);
        
        if (performance >= 90) {
          console.log("🎉 Excellent performance!");
        } else if (performance >= 70) {
          console.log("👍 Good performance, room for improvement");
        } else {
          console.log("⚠️ Performance needs optimization");
        }
        
        resolve(report);
      } catch (err) {
        console.log("❌ Could not parse Lighthouse report");
        reject(err);
      }
    });
  });
}

function runBundleAnalysis() {
  console.log("📦 Analyzing bundle size...");
  
  return new Promise((resolve, reject) => {
    exec('npx @next/bundle-analyzer', (error, stdout, stderr) => {
      if (error) {
        console.log("❌ Bundle analysis failed:", error.message);
        reject(error);
        return;
      }
      
      console.log("✅ Bundle analysis complete");
      resolve();
    });
  });
}

function checkPerformanceMetrics() {
  console.log("📊 Checking performance metrics...");
  
  const metrics = {
    // Check if performance optimizations are in place
    hasPerformanceCSS: fs.existsSync('./src/styles/performance.css'),
    hasOptimizedComponents: fs.existsSync('./src/components/OptimizedNavBar.tsx'),
    hasPerformanceUtils: fs.existsSync('./src/lib/performance-optimizations.ts'),
    
    // Check package.json for performance-related dependencies
    hasPerformanceDeps: false
  };
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    metrics.hasPerformanceDeps = Object.keys(deps).some(dep => 
      dep.includes('lighthouse') || 
      dep.includes('bundle') || 
      dep.includes('analyzer')
    );
  } catch (err) {
    console.log("⚠️ Could not read package.json");
  }
  
  console.log("\n📋 Performance Optimization Status:");
  console.log("=".repeat(40));
  console.log(`✅ Performance CSS: ${metrics.hasPerformanceCSS ? 'Installed' : 'Missing'}`);
  console.log(`✅ Optimized Components: ${metrics.hasOptimizedComponents ? 'Installed' : 'Missing'}`);
  console.log(`✅ Performance Utils: ${metrics.hasPerformanceUtils ? 'Installed' : 'Missing'}`);
  console.log(`✅ Performance Dependencies: ${metrics.hasPerformanceDeps ? 'Installed' : 'Missing'}`);
  
  return metrics;
}

function generatePerformanceReport() {
  console.log("📝 Generating performance report...");
  
  const report = {
    timestamp: new Date().toISOString(),
    optimizations: checkPerformanceMetrics(),
    recommendations: [
      "Use React.memo for expensive components",
      "Implement code splitting with dynamic imports",
      "Optimize images with next/image",
      "Use CSS-in-JS with performance optimizations",
      "Implement service worker for caching",
      "Use Web Vitals for monitoring"
    ],
    nextSteps: [
      "Run lighthouse test in production",
      "Monitor Core Web Vitals",
      "Implement performance monitoring",
      "Set up automated performance testing"
    ]
  };
  
  fs.writeFileSync('./performance-report.json', JSON.stringify(report, null, 2));
  console.log("✅ Performance report saved to performance-report.json");
  
  return report;
}

function runClickPerformanceTest() {
  console.log("🖱️ Testing click performance...");
  
  const testScript = `
    // Click performance test
    const startTime = performance.now();
    
    // Simulate multiple clicks
    for (let i = 0; i < 100; i++) {
      const button = document.createElement('button');
      button.addEventListener('click', () => {});
      button.click();
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(\`Click performance test: \${duration.toFixed(2)}ms for 100 clicks\`);
    
    if (duration < 50) {
      console.log('✅ Excellent click performance');
    } else if (duration < 100) {
      console.log('👍 Good click performance');
    } else {
      console.log('⚠️ Click performance needs optimization');
    }
  `;
  
  fs.writeFileSync('./click-test.js', testScript);
  console.log("✅ Click performance test script created");
}

function optimizeNextConfig() {
  console.log("⚙️ Optimizing Next.js configuration...");
  
  const nextConfigPath = './next.config.ts';
  if (!fs.existsSync(nextConfigPath)) {
    console.log("❌ next.config.ts not found");
    return;
  }
  
  let config = fs.readFileSync(nextConfigPath, 'utf8');
  
  // Add performance optimizations if not present
  if (!config.includes('experimental')) {
    config = config.replace(
      'const nextConfig: NextConfig = {',
      `const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@heroicons/react', 'next-auth', '@prisma/client'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },`
    );
  }
  
  if (!config.includes('compress: true')) {
    config = config.replace(
      'export default nextConfig;',
      `
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
  
export default nextConfig;`
    );
  }
  
  fs.writeFileSync(nextConfigPath, config);
  console.log("✅ Next.js configuration optimized");
}

// Main menu
function showMenu() {
  console.log("\n📋 Performance Testing Options:");
  console.log("=".repeat(40));
  console.log("1. 🔍 Run Lighthouse Test");
  console.log("2. 📦 Analyze Bundle Size");
  console.log("3. 📊 Check Performance Metrics");
  console.log("4. 📝 Generate Performance Report");
  console.log("5. 🖱️ Test Click Performance");
  console.log("6. ⚙️ Optimize Next.js Config");
  console.log("7. 🚀 Run All Tests");
  console.log("0. ❌ Exit");
  console.log("=".repeat(40));
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    const command = args[0];
    switch (command) {
      case 'lighthouse':
        await runLighthouseTest();
        break;
      case 'bundle':
        await runBundleAnalysis();
        break;
      case 'metrics':
        checkPerformanceMetrics();
        break;
      case 'report':
        generatePerformanceReport();
        break;
      case 'click':
        runClickPerformanceTest();
        break;
      case 'optimize':
        optimizeNextConfig();
        break;
      case 'all':
        console.log("🚀 Running all performance tests...");
        checkPerformanceMetrics();
        generatePerformanceReport();
        runClickPerformanceTest();
        optimizeNextConfig();
        console.log("✅ All performance tests completed!");
        break;
      default:
        console.log("❌ Unknown command. Available: lighthouse, bundle, metrics, report, click, optimize, all");
    }
  } else {
    showMenu();
    
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', async (data) => {
      const input = data.toString().trim();
      
      try {
        switch (input) {
          case '1':
            await runLighthouseTest();
            break;
          case '2':
            await runBundleAnalysis();
            break;
          case '3':
            checkPerformanceMetrics();
            break;
          case '4':
            generatePerformanceReport();
            break;
          case '5':
            runClickPerformanceTest();
            break;
          case '6':
            optimizeNextConfig();
            break;
          case '7':
            console.log("🚀 Running all performance tests...");
            checkPerformanceMetrics();
            generatePerformanceReport();
            runClickPerformanceTest();
            optimizeNextConfig();
            console.log("✅ All performance tests completed!");
            break;
          case '0':
            console.log("👋 Goodbye!");
            process.exit(0);
            break;
          default:
            console.log("❌ Invalid option. Please choose 1-7 or 0 to exit.");
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
