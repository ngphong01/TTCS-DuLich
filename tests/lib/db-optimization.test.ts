import { testUtils, performanceTestHelpers } from '@/lib/test-utils';
import { optimizedQueries } from '@/lib/db-optimization';

describe('Database Optimization', () => {
  beforeEach(async () => {
    await testUtils.cleanupTestData();
  });

  afterAll(async () => {
    await testUtils.cleanupTestData();
  });

  describe('Optimized Queries', () => {
    it('should perform optimized destinations query', async () => {
      // Create test data
      for (let i = 1; i <= 20; i++) {
        await testUtils.createTestDestination({
          name: `Destination ${i}`,
          slug: `destination-${i}`,
          price: 100 + i * 10,
          rating: 4.0 + (i % 5) * 0.2,
          country: i % 3 === 0 ? 'Vietnam' : i % 3 === 1 ? 'Thailand' : 'Malaysia',
          tags: i % 2 === 0 ? 'beach,travel' : 'mountain,adventure',
        });
      }

      const { result, duration } = await performanceTestHelpers.measureExecutionTime(async () => {
        return await optimizedQueries.getDestinationsOptimized({
          limit: 10,
          offset: 0,
          search: 'Destination',
          countries: ['Vietnam', 'Thailand'],
          priceMin: 100,
          priceMax: 300,
          ratingMin: 4.0,
          sort: 'rating-desc',
        });
      });

      expect(result.destinations).toBeDefined();
      expect(result.total).toBeGreaterThan(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.hasMore).toBeDefined();
      
      // Performance should be reasonable (less than 100ms for this test)
      expect(duration).toBeLessThan(100);
    });

    it('should handle pagination efficiently', async () => {
      // Create large dataset
      for (let i = 1; i <= 100; i++) {
        await testUtils.createTestDestination({
          name: `Test Destination ${i}`,
          slug: `test-destination-${i}`,
          price: 50 + i * 5,
          rating: 3.5 + (i % 15) * 0.1,
          country: 'Vietnam',
          tags: 'test',
        });
      }

      const { result, duration } = await performanceTestHelpers.measureExecutionTime(async () => {
        return await optimizedQueries.getDestinationsOptimized({
          limit: 20,
          offset: 40, // Page 3
        });
      });

      expect(result.destinations).toHaveLength(20);
      expect(result.page).toBe(3);
      expect(result.hasMore).toBe(true);
      expect(duration).toBeLessThan(50); // Should be fast even with pagination
    });

    it('should filter efficiently by multiple criteria', async () => {
      // Create diverse test data
      const countries = ['Vietnam', 'Thailand', 'Malaysia', 'Singapore'];
      const tags = ['beach', 'mountain', 'city', 'culture'];
      
      for (let i = 1; i <= 50; i++) {
        await testUtils.createTestDestination({
          name: `Destination ${i}`,
          slug: `destination-${i}`,
          price: 100 + i * 20,
          rating: 4.0 + (i % 10) * 0.1,
          country: countries[i % countries.length],
          tags: tags[i % tags.length],
        });
      }

      const { result, duration } = await performanceTestHelpers.measureExecutionTime(async () => {
        return await optimizedQueries.getDestinationsOptimized({
          limit: 10,
          offset: 0,
          countries: ['Vietnam', 'Thailand'],
          tags: ['beach', 'mountain'],
          priceMin: 200,
          priceMax: 800,
          ratingMin: 4.2,
          sort: 'price-asc',
        });
      });

      expect(result.destinations).toBeDefined();
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(duration).toBeLessThan(75); // Should handle complex filtering efficiently
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent queries efficiently', async () => {
      // Create test data
      for (let i = 1; i <= 30; i++) {
        await testUtils.createTestDestination({
          name: `Concurrent Test ${i}`,
          slug: `concurrent-test-${i}`,
          price: 100 + i * 10,
          rating: 4.0 + (i % 5) * 0.2,
          country: 'Vietnam',
          tags: 'test',
        });
      }

      const concurrentQueries = Array(10).fill(null).map(async (_, index) => {
        return await optimizedQueries.getDestinationsOptimized({
          limit: 5,
          offset: index * 5,
          search: 'Concurrent',
        });
      });

      const { result, duration } = await performanceTestHelpers.measureExecutionTime(async () => {
        return await Promise.all(concurrentQueries);
      });

      expect(result).toHaveLength(10);
      expect(duration).toBeLessThan(200); // Should handle 10 concurrent queries efficiently
    });
  });
});
