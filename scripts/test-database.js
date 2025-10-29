const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

console.log('🧪 Testing SQLite Database...');

try {
  // Create database directory if it doesn't exist
  const dbDir = path.join(__dirname, 'database');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('✅ Created database directory:', dbDir);
  }

  // Create SQLite database
  const dbPath = path.join(dbDir, 'travelgo.db');
  const db = new Database(dbPath);
  console.log('✅ SQLite database created:', dbPath);

  // Test connection
  const result = db.prepare('SELECT 1 as test').get();
  console.log('✅ Database connection test:', result);

  // Test sample query
  const destCount = db.prepare('SELECT COUNT(*) as count FROM destination').get();
  console.log('✅ Destination count:', destCount.count);

  // Test destinations query
  const destinations = db.prepare('SELECT * FROM destination LIMIT 3').all();
  console.log('✅ Sample destinations:', destinations.length);

  db.close();
  console.log('🎉 Database test completed successfully!');
  
} catch (error) {
  console.error('❌ Database test failed:', error.message);
  process.exit(1);
}
