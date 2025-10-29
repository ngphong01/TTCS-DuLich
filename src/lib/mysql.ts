// Load better-sqlite3 via dynamic require to avoid bundler resolution in dev
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Database: any = (global as any).__bSqlite || ((global as any).__bSqlite = (eval('require'))('better-sqlite3'));
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// SQLite configuration
const dbDir = join(process.cwd(), 'database');
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const dbPath = join(dbDir, 'travelgo.db');
const sqliteDb = new Database(dbPath);

// Initialize database with tables if not exists
const initDB = () => {
  const createTables = `
    CREATE TABLE IF NOT EXISTS user (
      id VARCHAR(255) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255),
      image TEXT,
      role VARCHAR(50) DEFAULT 'user',
      passwordHash TEXT,
      emailVerified BOOLEAN DEFAULT FALSE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS destination (
      id VARCHAR(255) PRIMARY KEY,
      slug VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      image TEXT,
      rating DECIMAL(3,2) DEFAULT 0.00,
      price DECIMAL(10,2) NOT NULL,
      country VARCHAR(100),
      tags TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS booking (
      id VARCHAR(255) PRIMARY KEY,
      destinationId VARCHAR(255) NOT NULL,
      userId VARCHAR(255),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      guests INTEGER DEFAULT 1,
      \`from\` DATE,
      \`to\` DATE,
      phone VARCHAR(20),
      note TEXT,
      price DECIMAL(10,2) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      paymentMethod VARCHAR(50),
      couponCode VARCHAR(50),
      discountAmount DECIMAL(10,2) DEFAULT 0,
      serviceFee DECIMAL(10,2) DEFAULT 0,
      tax DECIMAL(10,2) DEFAULT 0,
      totalAmount DECIMAL(10,2) NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS review (
      id VARCHAR(255) PRIMARY KEY,
      slug VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      userId VARCHAR(255),
      destinationId VARCHAR(255)
    );

    CREATE TABLE IF NOT EXISTS chatMessage (
      id VARCHAR(255) PRIMARY KEY,
      userId VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coupon (
      id VARCHAR(255) PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      description TEXT,
      discountType VARCHAR(20) DEFAULT 'percentage',
      discountValue DECIMAL(10,2) NOT NULL,
      minOrderAmount DECIMAL(10,2) DEFAULT 0,
      maxDiscountAmount DECIMAL(10,2),
      usageLimit INTEGER,
      usedCount INTEGER DEFAULT 0,
      isActive BOOLEAN DEFAULT TRUE,
      validFrom DATETIME DEFAULT CURRENT_TIMESTAMP,
      validTo DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

        CREATE TABLE IF NOT EXISTS payment_transaction (
          id VARCHAR(255) PRIMARY KEY,
          bookingId VARCHAR(255) NOT NULL,
          userId VARCHAR(255),
          amount DECIMAL(10,2) NOT NULL,
          currency VARCHAR(3) DEFAULT 'VND',
          paymentMethod VARCHAR(50) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          gatewayTransactionId VARCHAR(255),
          gatewayResponse TEXT,
          failureReason TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
  `;
  
  sqliteDb.exec(createTables);
  
  // Insert sample data if not exists
  const destCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM destination').get();
  if (destCount.count === 0) {
    const sampleDestinations = [
      {
        id: 'dest_1',
        slug: 'phu-quoc',
        name: 'Phú Quốc',
        description: 'Đảo ngọc xinh đẹp với những bãi biển tuyệt đẹp',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
        rating: 4.8,
        price: 2500000,
        country: 'Vietnam',
        tags: 'beach,island,relax'
      },
      {
        id: 'dest_2',
        slug: 'nha-trang',
        name: 'Nha Trang',
        description: 'Thành phố biển với nhiều hoạt động thú vị',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop',
        rating: 4.5,
        price: 1800000,
        country: 'Vietnam',
        tags: 'beach,city,adventure'
      },
      {
        id: 'dest_3',
        slug: 'da-lat',
        name: 'Đà Lạt',
        description: 'Thành phố ngàn hoa với khí hậu mát mẻ',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop',
        rating: 4.7,
        price: 1200000,
        country: 'Vietnam',
        tags: 'mountain,cool,flowers'
      }
    ];
    
    const insertDest = sqliteDb.prepare(`
      INSERT INTO destination 
      (id, slug, name, description, image, rating, price, country, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    sampleDestinations.forEach(dest => {
      insertDest.run(
        dest.id, dest.slug, dest.name, dest.description, 
        dest.image, dest.rating, dest.price, dest.country, dest.tags
      );
    });
    
    console.log('✅ Sample destinations inserted');
  }
};

// Initialize database
initDB();

// Test connection
export async function testConnection() {
  try {
    sqliteDb.prepare('SELECT 1 as test').get();
    console.log('✅ SQLite connection successful');
    return true;
  } catch (error) {
    console.error('❌ SQLite connection failed:', error);
    return false;
  }
}

// Execute query with parameters
export async function executeQuery<T = unknown>(
  query: string, 
  params: unknown[] = []
): Promise<T[]> {
  try {
    const stmt = sqliteDb.prepare(query);
    const rows = stmt.all(...params);
    return rows as T[];
  } catch (error) {
    console.error('Query error:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
}

// Execute single query (for INSERT, UPDATE, DELETE)
export async function executeSingleQuery(
  query: string, 
  params: unknown[] = []
): Promise<{ changes: number; lastInsertRowid: number }> {
  try {
    const stmt = sqliteDb.prepare(query);
    const result = stmt.run(...params);
    return { changes: result.changes, lastInsertRowid: result.lastInsertRowid };
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Get connection from database
export async function getConnection() {
  return sqliteDb;
}

// Close database connection
export async function closePool() {
  sqliteDb.close();
}

// Database helper functions
export const db = {
  // Raw query functions
  executeQuery,
  executeSingleQuery,
  // User operations
  async getUserByEmail(email: string) {
    const query = 'SELECT * FROM user WHERE email = ?';
    const users = await executeQuery(query, [email]);
    return users[0] || null;
  },

  async getUserById(id: string) {
    const query = 'SELECT * FROM user WHERE id = ?';
    const users = await executeQuery(query, [id]);
    return users[0] || null;
  },

  async createUser(userData: {
    id: string;
    email: string;
    name?: string;
    image?: string;
    role?: string;
    passwordHash?: string;
  }) {
    const query = `
      INSERT INTO user (id, email, name, image, role, passwordHash, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `;
    await executeSingleQuery(query, [
      userData.id,
      userData.email,
      userData.name,
      userData.image,
      userData.role || 'user',
      userData.passwordHash
    ]);
    return userData.id;
  },

  // Destination operations
  async getDestinations(limit = 10, offset = 0) {
    const query = `SELECT * FROM destination ORDER BY rating DESC LIMIT ? OFFSET ?`;
    return await executeQuery(query, [limit, offset]);
  },

  async getDestinationBySlug(slug: string) {
    const query = 'SELECT * FROM destination WHERE slug = ?';
    const destinations = await executeQuery(query, [slug]);
    return destinations[0] || null;
  },

  // Booking operations
  async createBooking(bookingData: {
    id: string;
    destinationId: string;
    userId?: string;
    name: string;
    email: string;
    guests: number;
    from?: string;
    to?: string;
    phone?: string;
    note?: string;
    price: number;
    status?: string;
    paymentMethod?: string;
    couponCode?: string;
    discountAmount?: number;
    serviceFee?: number;
    tax?: number;
    totalAmount: number;
  }) {
    const query = `
      INSERT INTO booking (
        id, destinationId, userId, name, email, guests, \`from\`, \`to\`, 
        phone, note, price, status, paymentMethod, couponCode, 
        discountAmount, serviceFee, tax, totalAmount, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `;
    await executeSingleQuery(query, [
      bookingData.id,
      bookingData.destinationId,
      bookingData.userId,
      bookingData.name,
      bookingData.email,
      bookingData.guests,
      bookingData.from,
      bookingData.to,
      bookingData.phone,
      bookingData.note,
      bookingData.price,
      bookingData.status || 'pending',
      bookingData.paymentMethod,
      bookingData.couponCode,
      bookingData.discountAmount || 0,
      bookingData.serviceFee || 0,
      bookingData.tax || 0,
      bookingData.totalAmount
    ]);
    return bookingData.id;
  },

  // Review operations
  async getReviewsByDestination(destinationId: string) {
    const query = 'SELECT * FROM review WHERE destinationId = ? ORDER BY date DESC';
    return await executeQuery(query, [destinationId]);
  },

  async createReview(reviewData: {
    id: string;
    slug: string;
    author: string;
    rating: number;
    comment: string;
    date: string;
    userId?: string;
    destinationId?: string;
  }) {
    const query = `
      INSERT INTO review (id, slug, author, rating, comment, date, userId, destinationId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await executeSingleQuery(query, [
      reviewData.id,
      reviewData.slug,
      reviewData.author,
      reviewData.rating,
      reviewData.comment,
      reviewData.date,
      reviewData.userId,
      reviewData.destinationId
    ]);
    return reviewData.id;
  },

  // Transaction operations
  async createTransaction(transactionData: {
    id: string;
    bookingId: string;
    userId?: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    status: string;
    gatewayTransactionId?: string;
    gatewayResponse?: string;
    failureReason?: string;
  }) {
    const query = `
          INSERT INTO payment_transaction (
        id, bookingId, userId, amount, currency, paymentMethod, 
        status, gatewayTransactionId, gatewayResponse, failureReason, 
        createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;
    await executeSingleQuery(query, [
      transactionData.id,
      transactionData.bookingId,
      transactionData.userId,
      transactionData.amount,
      transactionData.currency,
      transactionData.paymentMethod,
      transactionData.status,
      transactionData.gatewayTransactionId,
      transactionData.gatewayResponse,
      transactionData.failureReason
    ]);
    return transactionData.id;
  },

  // Coupon operations
  async getCouponByCode(code: string) {
    const query = 'SELECT * FROM coupon WHERE code = ? AND isActive = 1 AND datetime("now") BETWEEN validFrom AND validTo';
    const coupons = await executeQuery(query, [code]);
    return coupons[0] || null;
  },

  async updateCouponUsage(couponId: string) {
    const query = 'UPDATE coupon SET usedCount = usedCount + 1 WHERE id = ?';
    await executeSingleQuery(query, [couponId]);
  }
};

export default db;
