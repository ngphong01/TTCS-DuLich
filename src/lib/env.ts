/**
 * Environment Variables Validation
 * Đảm bảo tất cả environment variables cần thiết được cung cấp
 */

import { z } from 'zod';
import { existsSync } from 'fs';
import { join } from 'path';

// Schema validation cho environment variables
const envSchema = z.object({
  // Database
  DB_HOST: z.string().min(1, 'DB_HOST is required'),
  DB_PORT: z.string().regex(/^\d+$/, 'DB_PORT must be a number').transform(Number),
  DB_USER: z.string().min(1, 'DB_USER is required'),
  DB_PASSWORD: z.string().min(8, 'DB_PASSWORD must be at least 8 characters'),
  DB_NAME: z.string().min(1, 'DB_NAME is required'),
  
  // Authentication
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  
  // OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  
  // AI
  GEMINI_API_KEY: z.string().optional(),
  
  // Analytics
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  
  // Email
  RESEND_API_KEY: z.string().optional(),
  GMAIL_REFRESH_TOKEN: z.string().optional(),
  
  // Payment
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // Redis (optional)
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Monitoring (optional)
  SENTRY_DSN: z.string().optional(),
  SENTRY_ENV: z.string().optional(),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Parse và validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Environment validation failed:\n${missingVars.join('\n')}`);
    }
    throw error;
  }
};

// Export validated environment variables
export const env = parseEnv();

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;

// Helper functions
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

// Security helpers
export const getSecureConfig = () => {
  // Check for Gmail Service Account file
  const SERVICE_ACCOUNT_PATH = join(process.cwd(), 'mineral-subject-454003-c0-0ac6ec892af5.json');
  const hasGmailServiceAccount = existsSync(SERVICE_ACCOUNT_PATH);
  
  return {
    isProduction,
    isDevelopment,
    isTest,
    hasOAuth: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    hasStripe: !!(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET),
    hasEmail: !!env.RESEND_API_KEY || hasGmailServiceAccount,
    hasRedis: !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN),
    hasMonitoring: !!env.SENTRY_DSN,
  };
};

// Database connection string validation
export const getDatabaseUrl = () => {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = env;
  
  // Validate password strength in production
  if (isProduction && DB_PASSWORD.length < 16) {
    throw new Error('Database password must be at least 16 characters in production');
  }
  
  return `mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
};

// Log environment status (safe for production)
export const logEnvironmentStatus = () => {
  const config = getSecureConfig();
  
  console.log('🔧 Environment Configuration:');
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Database: SQLite (database/travelgo.db)`);
  console.log(`   OAuth: ${config.hasOAuth ? '✅' : '❌'}`);
  console.log(`   Stripe: ${config.hasStripe ? '✅' : '❌'}`);
  console.log(`   Email: ${config.hasEmail ? '✅' : '❌'}`);
  console.log(`   Redis: ${config.hasRedis ? '✅' : '❌'}`);
  console.log(`   Monitoring: ${config.hasMonitoring ? '✅' : '❌'}`);
};

// Validate at startup
if (typeof window === 'undefined') {
  // Only run on server side
  logEnvironmentStatus();
}
