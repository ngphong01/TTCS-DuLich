/**
 * Testing Infrastructure Setup
 * Jest configuration và test utilities
 */

import { NextRequest } from 'next/server';
import { getSession } from '@/lib/simple-auth';
import { db } from '@/lib/mysql';

// Test utilities
export const testUtils = {
  // Create test user
  async createTestUser(userData: {
    id?: string;
    email: string;
    name?: string;
    password?: string;
    role?: string;
  }) {
    const userId = userData.id || `test_user_${Date.now()}`;
    const passwordHash = userData.password ? await require('bcryptjs').hash(userData.password, 12) : null;
    
    await db.createUser({
      id: userId,
      email: userData.email,
      name: userData.name || userData.email.split('@')[0],
      role: userData.role || 'user',
      passwordHash,
    });
    
    return userId;
  },

  // Create test destination
  async createTestDestination(destinationData: {
    id?: string;
    name: string;
    slug: string;
    description?: string;
    price?: number;
    rating?: number;
    country?: string;
    tags?: string;
  }) {
    const destinationId = destinationData.id || `test_dest_${Date.now()}`;
    
    await db.executeSingleQuery(`
      INSERT INTO destination (
        id, name, slug, description, price, rating, country, tags, image, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      destinationId,
      destinationData.name,
      destinationData.slug,
      destinationData.description || 'Test destination description',
      destinationData.price || 100,
      destinationData.rating || 4.5,
      destinationData.country || 'Vietnam',
      destinationData.tags || 'test,travel',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop'
    ]);
    
    return destinationId;
  },

  // Clean up test data
  async cleanupTestData() {
    await db.executeSingleQuery('DELETE FROM chatMessage WHERE userId LIKE "test_%"');
    await db.executeSingleQuery('DELETE FROM transaction WHERE userId LIKE "test_%"');
    await db.executeSingleQuery('DELETE FROM booking WHERE userId LIKE "test_%"');
    await db.executeSingleQuery('DELETE FROM review WHERE userId LIKE "test_%"');
    await db.executeSingleQuery('DELETE FROM destination WHERE id LIKE "test_%"');
    await db.executeSingleQuery('DELETE FROM user WHERE id LIKE "test_%"');
  },

  // Mock request
  createMockRequest(url: string, options: RequestInit = {}): NextRequest {
    return new NextRequest(url, {
      method: 'GET',
      ...options,
    });
  },

  // Mock session
  async createMockSession(userId: string) {
    const user = await db.getUserById(userId);
    if (!user) throw new Error('User not found');
    
    // Mock session cookie
    const mockCookies = new Map();
    const sessionToken = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    mockCookies.set('simple-session', sessionToken);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.email.split('@')[0],
        role: user.role,
        emailVerified: user.emailVerified || false,
      },
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }
};

// Test database setup
export const testDbSetup = {
  async setup() {
    // Create test database if it doesn't exist
    try {
      await db.executeSingleQuery('CREATE DATABASE IF NOT EXISTS test_travelgo');
    } catch (error) {
      // Database might already exist
    }
  },

  async teardown() {
    await testUtils.cleanupTestData();
  }
};

// API test helpers
export const apiTestHelpers = {
  // Test API endpoint
  async testApiEndpoint(
    handler: (req: NextRequest) => Promise<Response>,
    request: NextRequest,
    expectedStatus: number = 200
  ) {
    const response = await handler(request);
    expect(response.status).toBe(expectedStatus);
    return response;
  },

  // Test authenticated endpoint
  async testAuthenticatedEndpoint(
    handler: (req: NextRequest) => Promise<Response>,
    request: NextRequest,
    userId: string,
    expectedStatus: number = 200
  ) {
    // Mock session for authenticated request
    const session = await testUtils.createMockSession(userId);
    
    const response = await handler(request);
    expect(response.status).toBe(expectedStatus);
    return response;
  },

  // Parse JSON response
  async parseJsonResponse(response: Response) {
    const data = await response.json();
    return data;
  }
};

// Performance test helpers
export const performanceTestHelpers = {
  // Measure execution time
  async measureExecutionTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  },

  // Load test helper
  async loadTest(
    handler: (req: NextRequest) => Promise<Response>,
    request: NextRequest,
    concurrent: number = 10,
    iterations: number = 100
  ) {
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      const promises = Array(concurrent).fill(null).map(async () => {
        const start = performance.now();
        const response = await handler(request);
        const duration = performance.now() - start;
        return {
          status: response.status,
          duration,
          timestamp: Date.now(),
        };
      });
      
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    }
    
    return {
      total: results.length,
      success: results.filter(r => r.status < 400).length,
      failed: results.filter(r => r.status >= 400).length,
      averageDuration: results.reduce((sum, r) => sum + r.duration, 0) / results.length,
      minDuration: Math.min(...results.map(r => r.duration)),
      maxDuration: Math.max(...results.map(r => r.duration)),
      results,
    };
  }
};
