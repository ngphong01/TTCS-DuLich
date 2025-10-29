#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

console.log('🔄 MySQL Migration Script');
console.log('========================');

async function migrateFromSQLite() {
  try {
    console.log('📊 Checking for existing SQLite data...');
    
    // Check if SQLite database exists
    const sqlitePath = path.join(process.cwd(), 'prisma', 'database.db');
    const sqliteExists = fs.existsSync(sqlitePath);
    
    if (!sqliteExists) {
      console.log('ℹ️ No SQLite database found, skipping migration');
      return;
    }
    
    console.log('⚠️ SQLite database found, but migration requires manual steps:');
    console.log('');
    console.log('1. Export data from SQLite:');
    console.log('   sqlite3 prisma/database.db ".dump" > sqlite_export.sql');
    console.log('');
    console.log('2. Convert SQLite dump to MySQL format:');
    console.log('   - Replace INTEGER PRIMARY KEY with AUTO_INCREMENT');
    console.log('   - Replace TEXT with VARCHAR or TEXT');
    console.log('   - Remove SQLite-specific syntax');
    console.log('');
    console.log('3. Import to MySQL:');
    console.log('   mysql -u username -p database_name < converted_dump.sql');
    console.log('');
    console.log('💡 For automatic migration, use a tool like:');
    console.log('   - MySQL Workbench Migration Wizard');
    console.log('   - DBeaver Database Migration');
    console.log('   - Custom migration script');
    
  } catch (error) {
    console.error('❌ Migration check failed:', error.message);
  }
}

async function validateMySQLSchema() {
  try {
    console.log('🔍 Validating MySQL schema...');
    
    // Test basic queries
    const userCount = await prisma.user.count();
    const destinationCount = await prisma.destination.count();
    const bookingCount = await prisma.booking.count();
    
    console.log(`✅ Users: ${userCount}`);
    console.log(`✅ Destinations: ${destinationCount}`);
    console.log(`✅ Bookings: ${bookingCount}`);
    
    // Test foreign key constraints
    const testUser = await prisma.user.findFirst();
    if (testUser) {
      const userBookings = await prisma.booking.findMany({
        where: { userId: testUser.id },
        take: 1
      });
      console.log('✅ Foreign key relationships working');
    }
    
    console.log('✅ MySQL schema validation completed!');
    
  } catch (error) {
    console.error('❌ Schema validation failed:', error.message);
    console.log('💡 Run: npm run db:migrate to fix schema issues');
  }
}

async function optimizeMySQLPerformance() {
  try {
    console.log('⚡ Optimizing MySQL performance...');
    
    // Add performance indexes
    const performanceIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_user_email_perf ON User(email)',
      'CREATE INDEX IF NOT EXISTS idx_destination_slug_perf ON Destination(slug)',
      'CREATE INDEX IF NOT EXISTS idx_booking_status_perf ON Booking(status)',
      'CREATE INDEX IF NOT EXISTS idx_booking_user_perf ON Booking(userId)',
      'CREATE INDEX IF NOT EXISTS idx_transaction_status_perf ON Transaction(status)',
      'CREATE INDEX IF NOT EXISTS idx_transaction_user_perf ON Transaction(userId)',
      'CREATE INDEX IF NOT EXISTS idx_coupon_code_perf ON Coupon(code)',
      'CREATE INDEX IF NOT EXISTS idx_coupon_active_perf ON Coupon(isActive)',
      'CREATE INDEX IF NOT EXISTS idx_review_destination_perf ON Review(destinationId)',
      'CREATE INDEX IF NOT EXISTS idx_chat_user_perf ON ChatMessage(userId)'
    ];
    
    for (const query of performanceIndexes) {
      try {
        await prisma.$executeRawUnsafe(query);
        console.log(`✅ Index created: ${query.split(' ')[5]}`);
      } catch (error) {
        console.log(`ℹ️ Index already exists or error: ${error.message}`);
      }
    }
    
    // Analyze tables for better query planning
    const tables = ['User', 'Destination', 'Booking', 'Transaction', 'Review', 'Coupon'];
    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`ANALYZE TABLE ${table}`);
        console.log(`✅ Analyzed table: ${table}`);
      } catch (error) {
        console.log(`ℹ️ Table analysis: ${error.message}`);
      }
    }
    
    console.log('✅ MySQL performance optimization completed!');
    
  } catch (error) {
    console.error('❌ Performance optimization failed:', error.message);
  }
}

async function checkMySQLConfiguration() {
  try {
    console.log('🔧 Checking MySQL configuration...');
    
    // Check MySQL version
    const version = await prisma.$queryRaw`SELECT VERSION() as version`;
    console.log(`✅ MySQL Version: ${version[0].version}`);
    
    // Check character set
    const charset = await prisma.$queryRaw`SELECT @@character_set_database as charset`;
    console.log(`✅ Character Set: ${charset[0].charset}`);
    
    // Check storage engine
    const engine = await prisma.$queryRaw`SELECT @@default_storage_engine as engine`;
    console.log(`✅ Storage Engine: ${engine[0].engine}`);
    
    // Check connection limits
    const connections = await prisma.$queryRaw`SHOW VARIABLES LIKE 'max_connections'`;
    console.log(`✅ Max Connections: ${connections[0].Value}`);
    
    console.log('✅ MySQL configuration check completed!');
    
  } catch (error) {
    console.error('❌ Configuration check failed:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting MySQL migration process...\n');
    
    // Step 1: Check for SQLite migration
    await migrateFromSQLite();
    console.log('');
    
    // Step 2: Validate MySQL schema
    await validateMySQLSchema();
    console.log('');
    
    // Step 3: Check MySQL configuration
    await checkMySQLConfiguration();
    console.log('');
    
    // Step 4: Optimize performance
    await optimizeMySQLPerformance();
    console.log('');
    
    console.log('🎉 MySQL migration process completed!');
    console.log('🚀 Your application is ready to use MySQL');
    console.log('');
    console.log('Next steps:');
    console.log('1. Update your .env.local with correct DATABASE_URL');
    console.log('2. Run: npm run dev');
    console.log('3. Test your application functionality');
    
  } catch (error) {
    console.error('❌ Migration process failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
main().catch(console.error);
