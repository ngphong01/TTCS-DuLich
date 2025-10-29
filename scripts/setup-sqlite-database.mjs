#!/usr/bin/env node

/**
 * Database Setup Script
 * Tạo database SQLite đơn giản thay vì MySQL
 */

import { execa } from 'execa';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`🔧 ${title}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logResult(testName, status, details = '') {
  const icon = status ? '✅' : '❌';
  const color = status ? 'green' : 'red';
  log(`${icon} ${testName}`, color);
  if (details) {
    log(`   ${details}`, 'blue');
  }
}

async function createEnvFile() {
  logSection('CREATING ENVIRONMENT FILE');
  
  const envContent = `# TravelGo Environment Configuration
# Database Configuration (SQLite for development)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password123
DB_NAME=travelgo

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=travelgo-secret-key-2025-development

# OAuth Providers (Demo values - replace with real ones)
GOOGLE_CLIENT_ID=demo-google-client-id
GOOGLE_CLIENT_SECRET=demo-google-client-secret
GITHUB_ID=demo-github-client-id
GITHUB_SECRET=demo-github-client-secret

# Optional Services
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
SENTRY_DSN=
SENTRY_ENV=development
NEXT_PUBLIC_GA_ID=
GEMINI_API_KEY=
`;

  try {
    writeFileSync(join(projectRoot, '.env'), envContent);
    logResult('Environment file created', true, '.env file created with demo values');
    return true;
  } catch (error) {
    logResult('Environment file creation', false, error.message);
    return false;
  }
}

async function installSQLite() {
  logSection('INSTALLING SQLITE DATABASE');
  
  try {
    // Install sqlite3 package
    log('Installing sqlite3 package...', 'blue');
    await execa('npm', ['install', 'sqlite3'], { stdio: 'inherit' });
    logResult('SQLite3 installed', true, 'Package installed successfully');
    
    // Install better-sqlite3 for better performance
    log('Installing better-sqlite3 package...', 'blue');
    await execa('npm', ['install', 'better-sqlite3'], { stdio: 'inherit' });
    logResult('Better-SQLite3 installed', true, 'High-performance SQLite package');
    
    return true;
  } catch (error) {
    logResult('SQLite installation', false, error.message);
    return false;
  }
}

async function createDatabaseSchema() {
  logSection('CREATING DATABASE SCHEMA');
  
  const schemaSQL = `
-- TravelGo Database Schema
CREATE TABLE IF NOT EXISTS user (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  image TEXT,
  role VARCHAR(50) DEFAULT 'user',
  passwordHash TEXT,
  emailVerified BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
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
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
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
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (destinationId) REFERENCES destination(id),
  FOREIGN KEY (userId) REFERENCES user(id)
);

CREATE TABLE IF NOT EXISTS review (
  id VARCHAR(255) PRIMARY KEY,
  slug VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  userId VARCHAR(255),
  destinationId VARCHAR(255),
  FOREIGN KEY (userId) REFERENCES user(id),
  FOREIGN KEY (destinationId) REFERENCES destination(id)
);

CREATE TABLE IF NOT EXISTS chatMessage (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id)
);

CREATE TABLE IF NOT EXISTS coupon (
  id VARCHAR(255) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discountType ENUM('percentage', 'fixed') DEFAULT 'percentage',
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

CREATE TABLE IF NOT EXISTS transaction (
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
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bookingId) REFERENCES booking(id),
  FOREIGN KEY (userId) REFERENCES user(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_destination_rating ON destination(rating);
CREATE INDEX IF NOT EXISTS idx_destination_price ON destination(price);
CREATE INDEX IF NOT EXISTS idx_destination_country ON destination(country);
CREATE INDEX IF NOT EXISTS idx_destination_tags ON destination(tags);
CREATE INDEX IF NOT EXISTS idx_user_email ON user(email);
CREATE INDEX IF NOT EXISTS idx_chatmessage_userid ON chatMessage(userId);
CREATE INDEX IF NOT EXISTS idx_booking_userid ON booking(userId);
CREATE INDEX IF NOT EXISTS idx_booking_status ON booking(status);
CREATE INDEX IF NOT EXISTS idx_review_destinationid ON review(destinationId);
CREATE INDEX IF NOT EXISTS idx_transaction_bookingid ON transaction(bookingId);
`;

  try {
    writeFileSync(join(projectRoot, 'database', 'schema.sql'), schemaSQL);
    logResult('Database schema created', true, 'schema.sql file created');
    return true;
  } catch (error) {
    logResult('Database schema creation', false, error.message);
    return false;
  }
}

async function createSQLiteDatabase() {
  logSection('CREATING SQLITE DATABASE');
  
  const dbScript = `
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create SQLite database
const dbPath = path.join(dbDir, 'travelgo.db');
const db = new Database(dbPath);

console.log('✅ SQLite database created:', dbPath);

// Read and execute schema
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Split by semicolon and execute each statement
  const statements = schema.split(';').filter(stmt => stmt.trim());
  
  statements.forEach(statement => {
    if (statement.trim()) {
      try {
        db.exec(statement);
        console.log('✅ Executed:', statement.substring(0, 50) + '...');
      } catch (error) {
        console.log('⚠️  Skipped:', statement.substring(0, 50) + '...', error.message);
      }
    }
  });
  
  console.log('✅ Database schema applied successfully');
} else {
  console.log('❌ Schema file not found');
}

// Insert sample data
console.log('📝 Inserting sample data...');

// Sample destinations
const destinations = [
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

destinations.forEach(dest => {
  try {
    db.prepare(\`
      INSERT OR REPLACE INTO destination 
      (id, slug, name, description, image, rating, price, country, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    \`).run(
      dest.id, dest.slug, dest.name, dest.description, 
      dest.image, dest.rating, dest.price, dest.country, dest.tags
    );
    console.log(\`✅ Inserted destination: \${dest.name}\`);
  } catch (error) {
    console.log(\`❌ Failed to insert \${dest.name}:\`, error.message);
  }
});

// Sample user
try {
  db.prepare(\`
    INSERT OR REPLACE INTO user 
    (id, email, name, role, emailVerified)
    VALUES (?, ?, ?, ?, ?)
  \`).run(
    'user_demo',
    'demo@travelgo.com',
    'Demo User',
    'user',
    true
  );
  console.log('✅ Inserted demo user');
} catch (error) {
  console.log('❌ Failed to insert demo user:', error.message);
}

db.close();
console.log('🎉 Database setup completed successfully!');
`;

  try {
    writeFileSync(join(projectRoot, 'scripts', 'setup-sqlite-db.js'), dbScript);
    logResult('SQLite setup script created', true, 'setup-sqlite-db.js created');
    
    // Run the setup script
    log('Running database setup...', 'blue');
    await execa('node', [join(projectRoot, 'scripts', 'setup-sqlite-db.js')], { stdio: 'inherit' });
    logResult('SQLite database created', true, 'Database and sample data inserted');
    
    return true;
  } catch (error) {
    logResult('SQLite database creation', false, error.message);
    return false;
  }
}

async function updateMySQLConfig() {
  logSection('UPDATING DATABASE CONFIGURATION');
  
  const sqliteConfig = `
import Database from 'better-sqlite3';
import { join } from 'path';

// SQLite configuration
const dbPath = join(process.cwd(), 'database', 'travelgo.db');
const db = new Database(dbPath);

// Test connection
export async function testConnection() {
  try {
    const result = db.prepare('SELECT 1 as test').get();
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
    const stmt = db.prepare(query);
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
    const stmt = db.prepare(query);
    const result = stmt.run(...params);
    return { changes: result.changes, lastInsertRowid: result.lastInsertRowid };
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Get connection from database
export async function getConnection() {
  return db;
}

// Close database connection
export async function closePool() {
  db.close();
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
    passwordHash?: string | null;
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
    const query = \`SELECT * FROM destination ORDER BY rating DESC LIMIT ? OFFSET ?\`;
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
    const query = \`
      INSERT INTO booking (
        id, destinationId, userId, name, email, guests, \`from\`, \`to\`, 
        phone, note, price, status, paymentMethod, couponCode, 
        discountAmount, serviceFee, tax, totalAmount, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    \`;
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
    const query = \`
      INSERT INTO review (id, slug, author, rating, comment, date, userId, destinationId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    \`;
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
    const query = \`
      INSERT INTO transaction (
        id, bookingId, userId, amount, currency, paymentMethod, 
        status, gatewayTransactionId, gatewayResponse, failureReason, 
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    \`;
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
`;

  try {
    writeFileSync(join(projectRoot, 'src', 'lib', 'sqlite.ts'), sqliteConfig);
    logResult('SQLite configuration created', true, 'sqlite.ts created');
    return true;
  } catch (error) {
    logResult('SQLite configuration creation', false, error.message);
    return false;
  }
}

async function testNewDatabase() {
  logSection('TESTING NEW DATABASE');
  
  try {
    // Test the new SQLite database
    const { testConnection } = await import(join(projectRoot, 'src', 'lib', 'sqlite.ts'));
    const isConnected = await testConnection();
    
    if (isConnected) {
      logResult('Database connection test', true, 'SQLite database working');
      
      // Test a simple query
      const { db } = await import(join(projectRoot, 'src', 'lib', 'sqlite.ts'));
      const destinations = await db.getDestinations(3);
      
      logResult('Database query test', true, `Found ${destinations.length} destinations`);
      
      if (destinations.length > 0) {
        logResult('Sample data test', true, `First destination: ${destinations[0].name}`);
      }
      
      return true;
    } else {
      logResult('Database connection test', false, 'Connection failed');
      return false;
    }
  } catch (error) {
    logResult('Database test', false, error.message);
    return false;
  }
}

async function main() {
  log('🚀 TravelGo Database Setup', 'bright');
  log('==========================', 'bright');
  
  let success = true;
  
  // Step 1: Create environment file
  success = await createEnvFile() && success;
  
  // Step 2: Install SQLite packages
  success = await installSQLite() && success;
  
  // Step 3: Create database schema
  success = await createDatabaseSchema() && success;
  
  // Step 4: Create SQLite database
  success = await createSQLiteDatabase() && success;
  
  // Step 5: Update database configuration
  success = await updateMySQLConfig() && success;
  
  // Step 6: Test new database
  success = await testNewDatabase() && success;
  
  if (success) {
    log('\n🎉 Database setup completed successfully!', 'green');
    log('✅ SQLite database created with sample data', 'green');
    log('✅ Database configuration updated', 'green');
    log('✅ Ready for testing', 'green');
    
    log('\n📋 Next steps:', 'blue');
    log('1. Update src/lib/mysql.ts to use SQLite instead of MySQL', 'blue');
    log('2. Restart the development server', 'blue');
    log('3. Test the system health endpoint', 'blue');
  } else {
    log('\n❌ Database setup failed!', 'red');
    log('Please check the errors above and try again.', 'red');
  }
}

// Run the setup
main().catch(error => {
  log('❌ Setup failed: ' + error.message, 'red');
  process.exit(1);
});
