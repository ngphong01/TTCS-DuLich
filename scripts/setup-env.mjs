#!/usr/bin/env node

/**
 * Environment Setup Script
 * Tạo file .env với các giá trị mặc định
 */

import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const envContent = `# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password123
DB_NAME=travelgo

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-32-character-secret-key-here

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email Service (Optional)
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@travelgo.com

# Monitoring (Optional)
SENTRY_DSN=your-sentry-dsn
SENTRY_ENV=development

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id
GEMINI_API_KEY=your-gemini-api-key

# Redis (Optional)
UPSTASH_REDIS_REST_URL=your-upstash-redis-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-token

# Payment (Optional)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
`;

const envPath = join(process.cwd(), '.env');

if (!existsSync(envPath)) {
  writeFileSync(envPath, envContent);
  console.log('✅ Created .env file with default values');
  console.log('📝 Please update the values in .env file as needed');
} else {
  console.log('⚠️  .env file already exists');
}

console.log('\n🔧 Required Environment Variables:');
console.log('- DB_PASSWORD: Must be at least 8 characters');
console.log('- NEXTAUTH_SECRET: Must be at least 32 characters');
console.log('- NEXTAUTH_URL: Your application URL');
