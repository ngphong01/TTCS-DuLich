const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

console.log('🚀 Creating SQLite Database for TravelGo...');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('✅ Created database directory:', dbDir);
}

// Create SQLite database
const dbPath = path.join(dbDir, 'travelgo.db');
const db = new Database(dbPath);

console.log('✅ SQLite database created:', dbPath);

// Create tables
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
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

db.exec(createTables);
console.log('✅ Database tables created');

// Insert sample data
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
  },
  {
    id: 'dest_4',
    slug: 'hoi-an',
    name: 'Hội An',
    description: 'Phố cổ đẹp như tranh với kiến trúc cổ kính',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop',
    rating: 4.9,
    price: 1500000,
    country: 'Vietnam',
    tags: 'ancient,culture,heritage'
  },
  {
    id: 'dest_5',
    slug: 'ha-long-bay',
    name: 'Vịnh Hạ Long',
    description: 'Kỳ quan thiên nhiên với hàng nghìn đảo đá vôi',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop',
    rating: 4.6,
    price: 2000000,
    country: 'Vietnam',
    tags: 'bay,limestone,unesco'
  }
];

console.log('📝 Inserting sample destinations...');
destinations.forEach(dest => {
  try {
    db.prepare(`
      INSERT OR REPLACE INTO destination 
      (id, slug, name, description, image, rating, price, country, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      dest.id, dest.slug, dest.name, dest.description, 
      dest.image, dest.rating, dest.price, dest.country, dest.tags
    );
    console.log(`✅ Inserted destination: ${dest.name}`);
  } catch (error) {
    console.log(`❌ Failed to insert ${dest.name}:`, error.message);
  }
});

// Sample user
console.log('👤 Inserting sample user...');
try {
  db.prepare(`
    INSERT OR REPLACE INTO user 
    (id, email, name, role, emailVerified)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    'user_demo',
    'demo@travelgo.com',
    'Demo User',
    'user',
    true
  );
  console.log('✅ Inserted demo user: demo@travelgo.com');
} catch (error) {
  console.log('❌ Failed to insert demo user:', error.message);
}

// Sample reviews
console.log('⭐ Inserting sample reviews...');
const reviews = [
  {
    id: 'review_1',
    slug: 'phu-quoc',
    author: 'Nguyễn Văn A',
    rating: 5,
    comment: 'Phú Quốc thật tuyệt vời! Bãi biển đẹp, nước trong xanh.',
    userId: 'user_demo',
    destinationId: 'dest_1'
  },
  {
    id: 'review_2',
    slug: 'nha-trang',
    author: 'Trần Thị B',
    rating: 4,
    comment: 'Nha Trang có nhiều hoạt động thú vị, phù hợp cho gia đình.',
    userId: 'user_demo',
    destinationId: 'dest_2'
  },
  {
    id: 'review_3',
    slug: 'da-lat',
    author: 'Lê Văn C',
    rating: 5,
    comment: 'Đà Lạt mát mẻ, không khí trong lành, rất thích hợp để nghỉ dưỡng.',
    userId: 'user_demo',
    destinationId: 'dest_3'
  }
];

reviews.forEach(review => {
  try {
    db.prepare(`
      INSERT OR REPLACE INTO review 
      (id, slug, author, rating, comment, date, userId, destinationId)
      VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?)
    `).run(
      review.id, review.slug, review.author, review.rating, 
      review.comment, review.userId, review.destinationId
    );
    console.log(`✅ Inserted review by ${review.author}`);
  } catch (error) {
    console.log(`❌ Failed to insert review by ${review.author}:`, error.message);
  }
});

// Test database
console.log('\n🧪 Testing database...');
try {
  const destCount = db.prepare('SELECT COUNT(*) as count FROM destination').get();
  const userCount = db.prepare('SELECT COUNT(*) as count FROM user').get();
  const reviewCount = db.prepare('SELECT COUNT(*) as count FROM review').get();
  
  console.log(`✅ Destinations: ${destCount.count}`);
  console.log(`✅ Users: ${userCount.count}`);
  console.log(`✅ Reviews: ${reviewCount.count}`);
} catch (error) {
  console.log('❌ Database test failed:', error.message);
}

db.close();
console.log('\n🎉 Database setup completed successfully!');
console.log('📁 Database location:', dbPath);
console.log('🚀 Ready to use with TravelGo application!');
