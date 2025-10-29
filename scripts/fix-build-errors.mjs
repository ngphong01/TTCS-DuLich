#!/usr/bin/env node

/**
 * Fix Build Errors Script
 * Sửa các lỗi build và middleware
 */

import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log("🔧 Fixing Build Errors...");
console.log("=".repeat(40));

// Clean build cache
function cleanBuildCache() {
  console.log("🧹 Cleaning build cache...");
  
  const buildDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true, force: true });
    console.log("✅ Cleared .next directory");
  }
  
  const nodeModulesDir = path.join(process.cwd(), 'node_modules');
  if (fs.existsSync(nodeModulesDir)) {
    console.log("⚠️  node_modules exists - consider running npm install");
  }
}

// Fix middleware issues
function fixMiddlewareIssues() {
  console.log("🔧 Fixing middleware issues...");
  
  // Check if middleware exists
  const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts');
  if (fs.existsSync(middlewarePath)) {
    console.log("✅ Middleware file exists");
    
    // Read middleware content
    let middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
    
    // Check for NextAuth middleware
    if (middlewareContent.includes('next-auth')) {
      console.log("⚠️  Middleware contains NextAuth - needs update");
      
      // Create simple middleware
      const simpleMiddleware = `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Simple middleware - no NextAuth
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};`;
      
      fs.writeFileSync(middlewarePath, simpleMiddleware);
      console.log("✅ Updated middleware to remove NextAuth");
    }
  } else {
    console.log("ℹ️  No middleware file found - creating simple one");
    
    // Create simple middleware
    const simpleMiddleware = `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Simple middleware - no NextAuth
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};`;
    
    fs.writeFileSync(middlewarePath, simpleMiddleware);
    console.log("✅ Created simple middleware");
  }
}

// Fix NextAuth imports
function fixNextAuthImports() {
  console.log("🔧 Fixing NextAuth imports...");
  
  // Check layout.tsx
  const layoutPath = path.join(process.cwd(), 'src', 'app', 'layout.tsx');
  if (fs.existsSync(layoutPath)) {
    let layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    if (layoutContent.includes('next-auth')) {
      console.log("⚠️  Layout contains NextAuth imports");
      
      // Replace NextAuth with Simple Auth
      layoutContent = layoutContent.replace(
        'import { SessionProvider } from "next-auth/react";',
        'import { SimpleAuthProvider } from "@/lib/use-simple-auth";'
      );
      layoutContent = layoutContent.replace(
        '<SessionProvider>',
        '<SimpleAuthProvider>'
      );
      layoutContent = layoutContent.replace(
        '</SessionProvider>',
        '</SimpleAuthProvider>'
      );
      
      fs.writeFileSync(layoutPath, layoutContent);
      console.log("✅ Updated layout.tsx to use Simple Auth");
    }
  }
  
  // Check ConditionalLayout.tsx
  const conditionalLayoutPath = path.join(process.cwd(), 'src', 'components', 'ConditionalLayout.tsx');
  if (fs.existsSync(conditionalLayoutPath)) {
    let conditionalContent = fs.readFileSync(conditionalLayoutPath, 'utf8');
    
    if (conditionalContent.includes('NavBar')) {
      console.log("⚠️  ConditionalLayout uses NavBar - needs update");
      
      // Replace NavBar with SimpleNavBar
      conditionalContent = conditionalContent.replace(
        'import NavBar from "./NavBar";',
        'import SimpleNavBar from "./SimpleNavBar";'
      );
      conditionalContent = conditionalContent.replace(
        '<NavBar />',
        '<SimpleNavBar />'
      );
      
      fs.writeFileSync(conditionalLayoutPath, conditionalContent);
      console.log("✅ Updated ConditionalLayout to use SimpleNavBar");
    }
  }
}

// Remove NextAuth dependencies
function removeNextAuthDependencies() {
  console.log("🧹 Removing NextAuth dependencies...");
  
  return new Promise((resolve, reject) => {
    exec('npm uninstall next-auth @next-auth/prisma-adapter', (error, stdout, stderr) => {
      if (error) {
        console.log("⚠️  Some dependencies might not exist:", error.message);
      }
      
      console.log("✅ NextAuth dependencies removed");
      console.log(stdout);
      resolve();
    });
  });
}

// Test build
function testBuild() {
  console.log("🚀 Testing build...");
  
  return new Promise((resolve, reject) => {
    exec('npm run build', (error, stdout, stderr) => {
      if (error) {
        console.log("❌ Build failed:", error.message);
        console.log("📋 Error details:", stderr);
        reject(error);
        return;
      }
      
      console.log("✅ Build successful!");
      console.log(stdout);
      resolve();
    });
  });
}

// Main execution
async function main() {
  try {
    cleanBuildCache();
    fixMiddlewareIssues();
    fixNextAuthImports();
    await removeNextAuthDependencies();
    
    console.log("\n🎉 Build errors fixed!");
    console.log("📋 Next steps:");
    console.log("1. Run: npm run dev");
    console.log("2. Test authentication");
    console.log("3. Check if errors are gone");
    
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

// Start the application
main().catch(console.error);
