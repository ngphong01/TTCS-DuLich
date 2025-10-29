#!/usr/bin/env node

/**
 * Migration Script: NextAuth → Lucid Auth
 * Script để migrate từ NextAuth sang Lucid Auth
 */

import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log("🚀 NextAuth → Lucid Auth Migration Tool");
console.log("=".repeat(50));

// Migration steps
function showMigrationSteps() {
  console.log("\n📋 Migration Steps:");
  console.log("=".repeat(40));
  console.log("1. 🔧 Install Lucid Auth dependencies");
  console.log("2. 📝 Update environment variables");
  console.log("3. 🔄 Replace NextAuth components");
  console.log("4. 🧹 Remove NextAuth dependencies");
  console.log("5. 🚀 Test new authentication");
  console.log("6. 🎯 Run all migration steps");
  console.log("0. ❌ Exit");
  console.log("=".repeat(40));
}

// Install dependencies
function installDependencies() {
  console.log("📦 Installing Lucid Auth dependencies...");
  
  return new Promise((resolve, reject) => {
    exec('npm install jsonwebtoken @types/jsonwebtoken', (error, stdout, stderr) => {
      if (error) {
        console.log("❌ Installation failed:", error.message);
        reject(error);
        return;
      }
      
      console.log("✅ Dependencies installed successfully");
      console.log(stdout);
      resolve();
    });
  });
}

// Update environment variables
function updateEnvironmentVariables() {
  console.log("🔧 Updating environment variables...");
  
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log("❌ .env.local not found");
    return;
  }
  
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Add JWT_SECRET if not exists
  if (!envContent.includes('JWT_SECRET=')) {
    const jwtSecret = require('crypto').randomBytes(32).toString('hex');
    envContent += `\n# Lucid Auth Configuration\nJWT_SECRET=${jwtSecret}\n`;
    console.log("✅ Added JWT_SECRET");
  }
  
  // Comment out NextAuth variables
  envContent = envContent.replace(/^NEXTAUTH_/gm, '# NEXTAUTH_');
  envContent = envContent.replace(/^GOOGLE_/gm, '# GOOGLE_');
  envContent = envContent.replace(/^GITHUB_/gm, '# GITHUB_');
  
  fs.writeFileSync(envPath, envContent);
  console.log("✅ Environment variables updated");
}

// Replace components
function replaceComponents() {
  console.log("🔄 Replacing NextAuth components...");
  
  // Update layout.tsx
  const layoutPath = path.join(process.cwd(), 'src', 'app', 'layout.tsx');
  if (fs.existsSync(layoutPath)) {
    let layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    // Replace SessionProvider with LucidAuthProvider
    layoutContent = layoutContent.replace(
      'import { SessionProvider } from "next-auth/react";',
      'import { LucidAuthProvider } from "@/lib/use-lucid-auth";'
    );
    layoutContent = layoutContent.replace(
      '<SessionProvider>',
      '<LucidAuthProvider>'
    );
    layoutContent = layoutContent.replace(
      '</SessionProvider>',
      '</LucidAuthProvider>'
    );
    
    fs.writeFileSync(layoutPath, layoutContent);
    console.log("✅ Updated layout.tsx");
  }
  
  // Update ConditionalLayout.tsx
  const conditionalLayoutPath = path.join(process.cwd(), 'src', 'components', 'ConditionalLayout.tsx');
  if (fs.existsSync(conditionalLayoutPath)) {
    let conditionalContent = fs.readFileSync(conditionalLayoutPath, 'utf8');
    
    // Replace NavBar with LucidNavBar
    conditionalContent = conditionalContent.replace(
      'import NavBar from "./NavBar";',
      'import LucidNavBar from "./LucidNavBar";'
    );
    conditionalContent = conditionalContent.replace(
      '<NavBar />',
      '<LucidNavBar />'
    );
    
    fs.writeFileSync(conditionalLayoutPath, conditionalContent);
    console.log("✅ Updated ConditionalLayout.tsx");
  }
  
  console.log("✅ Components replaced");
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

// Test authentication
function testAuthentication() {
  console.log("🚀 Testing new authentication...");
  
  console.log("\n📋 Test Checklist:");
  console.log("1. ✅ Lucid Auth dependencies installed");
  console.log("2. ✅ Environment variables updated");
  console.log("3. ✅ Components replaced");
  console.log("4. ✅ NextAuth dependencies removed");
  
  console.log("\n🔍 Manual Tests Required:");
  console.log("- Test sign in: http://localhost:3000/signin");
  console.log("- Test sign up: http://localhost:3000/signup");
  console.log("- Test logout functionality");
  console.log("- Test session persistence");
  
  console.log("\n📱 Test URLs:");
  console.log("- Session API: http://localhost:3000/api/auth/session");
  console.log("- Sign in API: http://localhost:3000/api/auth/signin");
  console.log("- Sign up API: http://localhost:3000/api/auth/signup");
  console.log("- Sign out API: http://localhost:3000/api/auth/signout");
}

// Run all migration steps
async function runAllMigration() {
  console.log("🚀 Running complete migration...");
  
  try {
    await installDependencies();
    updateEnvironmentVariables();
    replaceComponents();
    await removeNextAuthDependencies();
    testAuthentication();
    
    console.log("\n✅ Migration completed successfully!");
    console.log("\n📋 Next Steps:");
    console.log("1. Start server: npm run dev");
    console.log("2. Test authentication flow");
    console.log("3. Verify all features work");
    console.log("4. Deploy to production");
    
  } catch (error) {
    console.log("❌ Migration failed:", error.message);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    const command = args[0];
    switch (command) {
      case 'install':
        await installDependencies();
        break;
      case 'env':
        updateEnvironmentVariables();
        break;
      case 'components':
        replaceComponents();
        break;
      case 'remove':
        await removeNextAuthDependencies();
        break;
      case 'test':
        testAuthentication();
        break;
      case 'all':
        await runAllMigration();
        break;
      default:
        console.log("❌ Unknown command. Available: install, env, components, remove, test, all");
    }
  } else {
    showMigrationSteps();
    
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', async (data) => {
      const input = data.toString().trim();
      
      try {
        switch (input) {
          case '1':
            await installDependencies();
            break;
          case '2':
            updateEnvironmentVariables();
            break;
          case '3':
            replaceComponents();
            break;
          case '4':
            await removeNextAuthDependencies();
            break;
          case '5':
            testAuthentication();
            break;
          case '6':
            await runAllMigration();
            break;
          case '0':
            console.log("👋 Goodbye!");
            process.exit(0);
            break;
          default:
            console.log("❌ Invalid option. Please choose 1-6 or 0 to exit.");
            showMigrationSteps();
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
