import { NextRequest } from 'next/server';
import { GET } from '@/app/api/destinations/route';
import { testUtils, apiTestHelpers } from '@/lib/test-utils';

describe('/api/destinations', () => {
  beforeEach(async () => {
    await testUtils.cleanupTestData();
  });

  afterAll(async () => {
    await testUtils.cleanupTestData();
  });

  describe('GET', () => {
    it('should return destinations with default parameters', async () => {
      // Create test destinations
      await testUtils.createTestDestination({
        name: 'Test Destination 1',
        slug: 'test-destination-1',
        price: 100,
        rating: 4.5,
        country: 'Vietnam',
        tags: 'beach,travel',
      });

      await testUtils.createTestDestination({
        name: 'Test Destination 2',
        slug: 'test-destination-2',
        price: 200,
        rating: 4.8,
        country: 'Thailand',
        tags: 'mountain,adventure',
      });

      const request = testUtils.createMockRequest('http://localhost:3000/api/destinations');
      const response = await apiTestHelpers.testApiEndpoint(GET, request, 200);
      const data = await apiTestHelpers.parseJsonResponse(response);

      expect(data.total).toBeGreaterThanOrEqual(2);
      expect(data.page).toBe(1);
      expect(data.pageSize).toBe(9);
      expect(data.items).toHaveLength(2);
      expect(data.items[0]).toHaveProperty('slug');
      expect(data.items[0]).toHaveProperty('name');
      expect(data.items[0]).toHaveProperty('price');
      expect(data.items[0]).toHaveProperty('rating');
    });

    it('should filter destinations by search query', async () => {
      await testUtils.createTestDestination({
        name: 'Beach Paradise',
        slug: 'beach-paradise',
        price: 150,
        rating: 4.7,
        country: 'Vietnam',
        tags: 'beach,paradise',
      });

      await testUtils.createTestDestination({
        name: 'Mountain Adventure',
        slug: 'mountain-adventure',
        price: 300,
        rating: 4.9,
        country: 'Nepal',
        tags: 'mountain,adventure',
      });

      const request = testUtils.createMockRequest('http://localhost:3000/api/destinations?q=beach');
      const response = await apiTestHelpers.testApiEndpoint(GET, request, 200);
      const data = await apiTestHelpers.parseJsonResponse(response);

      expect(data.items).toHaveLength(1);
      expect(data.items[0].name).toBe('Beach Paradise');
    });

    it('should filter destinations by price range', async () => {
      await testUtils.createTestDestination({
        name: 'Budget Destination',
        slug: 'budget-destination',
        price: 50,
        rating: 4.0,
        country: 'Vietnam',
        tags: 'budget',
      });

      await testUtils.createTestDestination({
        name: 'Luxury Destination',
        slug: 'luxury-destination',
        price: 500,
        rating: 4.9,
        country: 'Maldives',
        tags: 'luxury',
      });

      const request = testUtils.createMockRequest('http://localhost:3000/api/destinations?priceMin=100&priceMax=300');
      const response = await apiTestHelpers.testApiEndpoint(GET, request, 200);
      const data = await apiTestHelpers.parseJsonResponse(response);

      // Should return empty results as both destinations are outside price range
      expect(data.items).toHaveLength(0);
    });

    it('should filter destinations by country', async () => {
      await testUtils.createTestDestination({
        name: 'Vietnam Destination',
        slug: 'vietnam-destination',
        price: 100,
        rating: 4.5,
        country: 'Vietnam',
        tags: 'culture',
      });

      await testUtils.createTestDestination({
        name: 'Thailand Destination',
        slug: 'thailand-destination',
        price: 150,
        rating: 4.6,
        country: 'Thailand',
        tags: 'culture',
      });

      const request = testUtils.createMockRequest('http://localhost:3000/api/destinations?countries=Vietnam');
      const response = await apiTestHelpers.testApiEndpoint(GET, request, 200);
      const data = await apiTestHelpers.parseJsonResponse(response);

      expect(data.items).toHaveLength(1);
      expect(data.items[0].country).toBe('Vietnam');
    });

    it('should sort destinations by rating', async () => {
      await testUtils.createTestDestination({
        name: 'Low Rating Destination',
        slug: 'low-rating-destination',
        price: 100,
        rating: 3.5,
        country: 'Vietnam',
        tags: 'test',
      });

      await testUtils.createTestDestination({
        name: 'High Rating Destination',
        slug: 'high-rating-destination',
        price: 200,
        rating: 4.8,
        country: 'Thailand',
        tags: 'test',
      });

      const request = testUtils.createMockRequest('http://localhost:3000/api/destinations?sort=rating-desc');
      const response = await apiTestHelpers.testApiEndpoint(GET, request, 200);
      const data = await apiTestHelpers.parseJsonResponse(response);

      expect(data.items).toHaveLength(2);
      expect(data.items[0].rating).toBeGreaterThanOrEqual(data.items[1].rating);
    });

    it('should handle pagination correctly', async () => {
      // Create multiple destinations
      for (let i = 1; i <= 15; i++) {
        await testUtils.createTestDestination({
          name: `Destination ${i}`,
          slug: `destination-${i}`,
          price: 100 + i * 10,
          rating: 4.0 + (i % 5) * 0.2,
          country: i % 2 === 0 ? 'Vietnam' : 'Thailand',
          tags: 'test',
        });
      }

      const request = testUtils.createMockRequest('http://localhost:3000/api/destinations?page=2&pageSize=5');
      const response = await apiTestHelpers.testApiEndpoint(GET, request, 200);
      const data = await apiTestHelpers.parseJsonResponse(response);

      expect(data.page).toBe(2);
      expect(data.pageSize).toBe(5);
      expect(data.items).toHaveLength(5);
      expect(data.hasMore).toBe(true);
    });

    it('should return fallback data when database fails', async () => {
      // Mock database error
      jest.mock('@/lib/mysql', () => ({
        db: {
          executeQuery: jest.fn().mockRejectedValue(new Error('Database connection failed')),
        },
      }));

      const request = testUtils.createMockRequest('http://localhost:3000/api/destinations');
      const response = await apiTestHelpers.testApiEndpoint(GET, request, 200);
      const data = await apiTestHelpers.parseJsonResponse(response);

      expect(data.fallback).toBe(true);
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
    });

    it('should validate query parameters', async () => {
      const request = testUtils.createMockRequest('http://localhost:3000/api/destinations?invalidParam=test');
      const response = await apiTestHelpers.testApiEndpoint(GET, request, 200);
      const data = await apiTestHelpers.parseJsonResponse(response);

      // Should still work with invalid parameters (they get ignored)
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
    });
  });
});
