import { NextRequest } from 'next/server';
import { GET } from '@/app/api/health/route';
import { apiTestHelpers } from '@/lib/test-utils';

describe('/api/health', () => {
  describe('GET', () => {
    it('should return health status', async () => {
      const request = apiTestHelpers.createMockRequest('http://localhost:3000/api/health');
      const response = await apiTestHelpers.testApiEndpoint(GET, request, 200);
      const data = await apiTestHelpers.parseJsonResponse(response);

      expect(data.status).toBeDefined();
      expect(data.timestamp).toBeDefined();
      expect(data.responseTime).toBeDefined();
      expect(data.uptime).toBeDefined();
      expect(data.services).toBeDefined();
      expect(data.services.database).toBeDefined();
      expect(data.services.api).toBe('healthy');
      expect(data.services.memory).toBeDefined();
      expect(data.services.features).toBeDefined();
      expect(data.environment).toBeDefined();
      expect(data.version).toBeDefined();
    });

    it('should return 503 when database is unhealthy', async () => {
      // Mock database error
      jest.mock('@/lib/mysql', () => ({
        testConnection: jest.fn().mockResolvedValue(false),
      }));

      const request = apiTestHelpers.createMockRequest('http://localhost:3000/api/health');
      const response = await apiTestHelpers.testApiEndpoint(GET, request, 503);
      const data = await apiTestHelpers.parseJsonResponse(response);

      expect(data.status).toBe('unhealthy');
      expect(data.services.database).toBe('unhealthy');
    });
  });

  describe('POST', () => {
    it('should return detailed health status', async () => {
      const request = apiTestHelpers.createMockRequest('http://localhost:3000/api/health', {
        method: 'POST',
      });
      const response = await apiTestHelpers.testApiEndpoint(GET, request, 200);
      const data = await apiTestHelpers.parseJsonResponse(response);

      expect(data.status).toBeDefined();
      expect(data.detailed).toBeDefined();
      expect(data.detailed.nodeVersion).toBeDefined();
      expect(data.detailed.platform).toBeDefined();
      expect(data.detailed.arch).toBeDefined();
      expect(data.detailed.cpuUsage).toBeDefined();
      expect(data.detailed.freeMemory).toBeDefined();
      expect(data.detailed.totalMemory).toBeDefined();
    });
  });
});
