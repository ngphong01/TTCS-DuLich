/**
 * Database Optimization Utilities
 * Tối ưu hóa queries và thêm indexes
 */

import { db } from './mysql';
import { dbLogger, createTimer } from './logger';

// Database indexes để tối ưu hóa performance
export const DATABASE_INDEXES = [
  // Destination indexes
  'CREATE INDEX IF NOT EXISTS idx_destination_rating ON destination(rating DESC)',
  'CREATE INDEX IF NOT EXISTS idx_destination_price ON destination(price)',
  'CREATE INDEX IF NOT EXISTS idx_destination_country ON destination(country)',
  'CREATE INDEX IF NOT EXISTS idx_destination_slug ON destination(slug)',
  'CREATE INDEX IF NOT EXISTS idx_destination_tags ON destination(tags)',
  'CREATE INDEX IF NOT EXISTS idx_destination_created ON destination(createdAt)',
  
  // User indexes
  'CREATE INDEX IF NOT EXISTS idx_user_email ON user(email)',
  'CREATE INDEX IF NOT EXISTS idx_user_role ON user(role)',
  'CREATE INDEX IF NOT EXISTS idx_user_created ON user(createdAt)',
  
  // Booking indexes
  'CREATE INDEX IF NOT EXISTS idx_booking_user ON booking(userId)',
  'CREATE INDEX IF NOT EXISTS idx_booking_destination ON booking(destinationId)',
  'CREATE INDEX IF NOT EXISTS idx_booking_status ON booking(status)',
  'CREATE INDEX IF NOT EXISTS idx_booking_created ON booking(createdAt)',
  'CREATE INDEX IF NOT EXISTS idx_booking_email ON booking(email)',
  
  // Review indexes
  'CREATE INDEX IF NOT EXISTS idx_review_destination ON review(destinationId)',
  'CREATE INDEX IF NOT EXISTS idx_review_user ON review(userId)',
  'CREATE INDEX IF NOT EXISTS idx_review_date ON review(date DESC)',
  'CREATE INDEX IF NOT EXISTS idx_review_rating ON review(rating)',
  
  // Transaction indexes
  'CREATE INDEX IF NOT EXISTS idx_transaction_booking ON transaction(bookingId)',
  'CREATE INDEX IF NOT EXISTS idx_transaction_user ON transaction(userId)',
  'CREATE INDEX IF NOT EXISTS idx_transaction_status ON transaction(status)',
  'CREATE INDEX IF NOT EXISTS idx_transaction_created ON transaction(createdAt)',
  
  // Chat message indexes
  'CREATE INDEX IF NOT EXISTS idx_chat_user ON chatMessage(userId)',
  'CREATE INDEX IF NOT EXISTS idx_chat_created ON chatMessage(createdAt DESC)',
  
  // Coupon indexes
  'CREATE INDEX IF NOT EXISTS idx_coupon_code ON coupon(code)',
  'CREATE INDEX IF NOT EXISTS idx_coupon_active ON coupon(isActive)',
  'CREATE INDEX IF NOT EXISTS idx_coupon_valid ON coupon(validFrom, validTo)',
];

// Optimized query functions
export const optimizedQueries = {
  // Get destinations với pagination và filtering
  async getDestinationsOptimized(params: {
    limit?: number;
    offset?: number;
    search?: string;
    countries?: string[];
    tags?: string[];
    priceMin?: number;
    priceMax?: number;
    ratingMin?: number;
    sort?: string;
  }) {
    const timer = createTimer('get-destinations-optimized');
    
    try {
      const {
        limit = 10,
        offset = 0,
        search,
        countries = [],
        tags = [],
        priceMin = 0,
        priceMax = Infinity,
        ratingMin = 0,
        sort = 'rating-desc'
      } = params;

      // Build WHERE conditions
      const conditions: string[] = [];
      const queryParams: unknown[] = [];

      // Rating filter
      if (ratingMin > 0) {
        conditions.push('rating >= ?');
        queryParams.push(ratingMin);
      }

      // Price filters
      conditions.push('price >= ?');
      queryParams.push(priceMin);
      
      if (Number.isFinite(priceMax)) {
        conditions.push('price <= ?');
        queryParams.push(priceMax);
      }

      // Search filter
      if (search) {
        conditions.push('(LOWER(name) LIKE ? OR LOWER(country) LIKE ? OR LOWER(tags) LIKE ?)');
        const searchTerm = `%${search.toLowerCase()}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }

      // Countries filter
      if (countries.length > 0) {
        const placeholders = countries.map(() => '?').join(',');
        conditions.push(`country IN (${placeholders})`);
        queryParams.push(...countries);
      }

      // Tags filter
      if (tags.length > 0) {
        const tagConditions = tags.map(() => 'tags LIKE ?');
        conditions.push(`(${tagConditions.join(' AND ')})`);
        queryParams.push(...tags.map(tag => `%${tag}%`));
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Order by
      let orderBy = '';
      switch (sort) {
        case 'price-asc':
          orderBy = 'ORDER BY price ASC';
          break;
        case 'price-desc':
          orderBy = 'ORDER BY price DESC';
          break;
        case 'rating-desc':
          orderBy = 'ORDER BY rating DESC';
          break;
        case 'name-asc':
          orderBy = 'ORDER BY name ASC';
          break;
        default:
          orderBy = 'ORDER BY rating DESC';
      }

      // Get total count (optimized)
      const countQuery = `SELECT COUNT(*) as total FROM destination ${whereClause}`;
      const countResult = await db.executeQuery<{total: number}>(countQuery, queryParams);
      const total = countResult[0]?.total || 0;

      // Get destinations với LIMIT/OFFSET
      const query = `
        SELECT * FROM destination 
        ${whereClause} 
        ${orderBy} 
        LIMIT ? OFFSET ?
      `;
      
      const destinations = await db.executeQuery(query, [...queryParams, limit, offset]);

      timer.end({ 
        totalResults: total, 
        returnedResults: destinations.length,
        searchTerm: search,
        filters: { countries: countries.length, tags: tags.length }
      });

      return {
        destinations,
        total,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
        hasMore: offset + limit < total
      };

    } catch (error) {
      dbLogger.error('Optimized destinations query failed', error instanceof Error ? error : undefined, {
        params: JSON.stringify(params)
      });
      throw error;
    }
  },

  // Get user bookings với pagination
  async getUserBookingsOptimized(userId: string, params: {
    limit?: number;
    offset?: number;
    status?: string;
  }) {
    const timer = createTimer('get-user-bookings-optimized');
    
    try {
      const { limit = 10, offset = 0, status } = params;
      
      const conditions: string[] = ['userId = ?'];
      const queryParams: unknown[] = [userId];
      
      if (status) {
        conditions.push('status = ?');
        queryParams.push(status);
      }
      
      const whereClause = `WHERE ${conditions.join(' AND ')}`;
      
      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM booking ${whereClause}`;
      const countResult = await db.executeQuery<{total: number}>(countQuery, queryParams);
      const total = countResult[0]?.total || 0;
      
      // Get bookings
      const query = `
        SELECT b.*, d.name as destinationName, d.image as destinationImage
        FROM booking b
        LEFT JOIN destination d ON b.destinationId = d.id
        ${whereClause}
        ORDER BY b.createdAt DESC
        LIMIT ? OFFSET ?
      `;
      
      const bookings = await db.executeQuery(query, [...queryParams, limit, offset]);
      
      timer.end({ 
        userId, 
        totalResults: total, 
        returnedResults: bookings.length,
        status 
      });
      
      return {
        bookings,
        total,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
        hasMore: offset + limit < total
      };
      
    } catch (error) {
      dbLogger.error('Optimized user bookings query failed', error instanceof Error ? error : undefined, {
        userId,
        params: JSON.stringify(params)
      });
      throw error;
    }
  },

  // Get destination reviews với pagination
  async getDestinationReviewsOptimized(destinationId: string, params: {
    limit?: number;
    offset?: number;
    rating?: number;
  }) {
    const timer = createTimer('get-destination-reviews-optimized');
    
    try {
      const { limit = 10, offset = 0, rating } = params;
      
      const conditions: string[] = ['destinationId = ?'];
      const queryParams: unknown[] = [destinationId];
      
      if (rating) {
        conditions.push('rating = ?');
        queryParams.push(rating);
      }
      
      const whereClause = `WHERE ${conditions.join(' AND ')}`;
      
      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM review ${whereClause}`;
      const countResult = await db.executeQuery<{total: number}>(countQuery, queryParams);
      const total = countResult[0]?.total || 0;
      
      // Get reviews
      const query = `
        SELECT * FROM review
        ${whereClause}
        ORDER BY date DESC
        LIMIT ? OFFSET ?
      `;
      
      const reviews = await db.executeQuery(query, [...queryParams, limit, offset]);
      
      timer.end({ 
        destinationId, 
        totalResults: total, 
        returnedResults: reviews.length,
        rating 
      });
      
      return {
        reviews,
        total,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
        hasMore: offset + limit < total
      };
      
    } catch (error) {
      dbLogger.error('Optimized destination reviews query failed', error instanceof Error ? error : undefined, {
        destinationId,
        params: JSON.stringify(params)
      });
      throw error;
    }
  }
};

// Database maintenance functions
export const dbMaintenance = {
  // Create all indexes
  async createIndexes() {
    const timer = createTimer('create-database-indexes');
    
    try {
      for (const indexQuery of DATABASE_INDEXES) {
        await db.executeSingleQuery(indexQuery);
      }
      
      dbLogger.info('All database indexes created successfully');
      timer.end({ indexesCreated: DATABASE_INDEXES.length });
      
    } catch (error) {
      dbLogger.error('Failed to create database indexes', error instanceof Error ? error : undefined);
      throw error;
    }
  },

  // Analyze table performance
  async analyzeTables() {
    const timer = createTimer('analyze-tables');
    
    try {
      const tables = ['destination', 'user', 'booking', 'review', 'transaction', 'chatMessage', 'coupon'];
      const results: Record<string, any> = {};
      
      for (const table of tables) {
        const analyzeQuery = `ANALYZE TABLE ${table}`;
        const result = await db.executeQuery(analyzeQuery);
        results[table] = result[0];
      }
      
      timer.end({ tablesAnalyzed: tables.length });
      return results;
      
    } catch (error) {
      dbLogger.error('Failed to analyze tables', error instanceof Error ? error : undefined);
      throw error;
    }
  },

  // Get database statistics
  async getDatabaseStats() {
    const timer = createTimer('get-database-stats');
    
    try {
      const stats = await db.executeQuery(`
        SELECT 
          TABLE_NAME as table_name,
          TABLE_ROWS as row_count,
          DATA_LENGTH as data_size,
          INDEX_LENGTH as index_size,
          (DATA_LENGTH + INDEX_LENGTH) as total_size
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE()
        ORDER BY total_size DESC
      `);
      
      timer.end({ tablesCounted: stats.length });
      return stats;
      
    } catch (error) {
      dbLogger.error('Failed to get database stats', error instanceof Error ? error : undefined);
      throw error;
    }
  }
};
