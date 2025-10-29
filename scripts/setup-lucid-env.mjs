#!/usr/bin/env node

/**
 * Setup Lucid Auth Environment Variables
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

console.log("🔧 Setting up Lucid Auth environment variables...");

// Generate JWT secret
const jwtSecret = crypto.randomBytes(32).toString('hex');

// Environment content
const envContent = `# Lucid Auth Configuration
JWT_SECRET=${jwtSecret}

# Database
DATABASE_URL="mysql://root:123456@localhost:3306/travelgo"

# Commented out NextAuth variables (no longer needed)
# NEXTAUTH_SECRET=${jwtSecret}
# NEXTAUTH_URL=http://localhost:3000
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
# GITHUB_ID=your-github-id
# GITHUB_SECRET=your-github-secret
`;

// Write to .env.local
const envPath = path.join(process.cwd(), '.env.local');
fs.writeFileSync(envPath, envContent);

console.log("✅ Environment variables set up successfully!");
console.log(`🔐 JWT_SECRET: ${jwtSecret.substring(0, 16)}...`);
console.log("📝 Updated .env.local with Lucid Auth configuration");
console.log("🚀 Ready to use Lucid Auth!");
