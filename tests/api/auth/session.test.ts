import { NextRequest } from 'next/server';
import { GET } from '@/app/api/auth/session/route';
import { testUtils, apiTestHelpers } from '@/lib/test-utils';

describe('/api/auth/session', () => {
  beforeEach(async () => {
    await testUtils.cleanupTestData();
  });

  afterAll(async () => {
    await testUtils.cleanupTestData();
  });

  describe('GET', () => {
    it('should return error when no session exists', async () => {
      const request = testUtils.createMockRequest('http://localhost:3000/api/auth/session');
      const response = await apiTestHelpers.testApiEndpoint(GET, request, 200);
      const data = await apiTestHelpers.parseJsonResponse(response);

      expect(data.status).toBe('error');
      expect(data.message).toBe('No active session');
      expect(data.user).toBeNull();
    });

    it('should return user session when valid session exists', async () => {
      // Create test user
      const userId = await testUtils.createTestUser({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      });

      // Create mock session
      const session = await testUtils.createMockSession(userId);

      // Mock the getSession function to return our test session
      jest.mock('@/lib/simple-auth', () => ({
        getSession: jest.fn().mockResolvedValue(session),
      }));

      const request = testUtils.createMockRequest('http://localhost:3000/api/auth/session');
      const response = await apiTestHelpers.testApiEndpoint(GET, request, 200);
      const data = await apiTestHelpers.parseJsonResponse(response);

      expect(data.status).toBe('success');
      expect(data.message).toBe('User session found');
      expect(data.user).toEqual(session.user);
      expect(data.expires).toBe(session.expires);
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      jest.mock('@/lib/mysql', () => ({
        db: {
          getUserById: jest.fn().mockRejectedValue(new Error('Database connection failed')),
        },
      }));

      const request = testUtils.createMockRequest('http://localhost:3000/api/auth/session');
      const response = await apiTestHelpers.testApiEndpoint(GET, request, 500);
      const data = await apiTestHelpers.parseJsonResponse(response);

      expect(data.status).toBe('error');
      expect(data.error).toBeDefined();
    });
  });
});
