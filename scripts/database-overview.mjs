#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('🗄️ DATABASE OVERVIEW');
console.log('==================');

async function showDatabaseInfo() {
  try {
    // Database version và thông tin cơ bản
    const version = await prisma.$queryRaw`SELECT VERSION() as version`;
    const dbInfo = await prisma.$queryRaw`SELECT DATABASE() as current_db`;
    
    console.log(`📊 Database: ${dbInfo[0].current_db}`);
    console.log(`🔧 Version: ${version[0].version}`);
    console.log('');
  } catch (error) {
    console.error('❌ Error getting database info:', error.message);
  }
}

async function showTablesOverview() {
  try {
    console.log('📋 TABLES OVERVIEW');
    console.log('==================');
    
    // Lấy danh sách tables
    const tables = await prisma.$queryRaw`SHOW TABLES`;
    
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`\n📁 ${tableName.toUpperCase()}`);
      console.log('─'.repeat(50));
      
      // Lấy thông tin columns
      const columns = await prisma.$queryRaw`DESCRIBE ${tableName}`;
      
      columns.forEach(col => {
        const nullable = col.Null === 'YES' ? 'NULL' : 'NOT NULL';
        const key = col.Key ? ` [${col.Key}]` : '';
        console.log(`  ${col.Field.padEnd(20)} ${col.Type.padEnd(15)} ${nullable}${key}`);
      });
      
      // Đếm số records
      const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM ${tableName}`;
      console.log(`  📊 Records: ${count[0].count}`);
    }
  } catch (error) {
    console.error('❌ Error getting tables info:', error.message);
  }
}

async function showDataSummary() {
  try {
    console.log('\n📈 DATA SUMMARY');
    console.log('================');
    
    // Users
    const userCount = await prisma.user.count();
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    console.log(`👥 Users: ${userCount} (${adminCount} admins)`);
    
    // Destinations
    const destCount = await prisma.destination.count();
    console.log(`🏖️ Destinations: ${destCount}`);
    
    // Bookings
    const bookingCount = await prisma.booking.count();
    const pendingBookings = await prisma.booking.count({ where: { status: 'pending' } });
    const paidBookings = await prisma.booking.count({ where: { status: 'paid' } });
    console.log(`📅 Bookings: ${bookingCount} (${pendingBookings} pending, ${paidBookings} paid)`);
    
    // Reviews
    const reviewCount = await prisma.review.count();
    console.log(`⭐ Reviews: ${reviewCount}`);
    
    // Transactions
    const transactionCount = await prisma.transaction.count();
    const completedTransactions = await prisma.transaction.count({ where: { status: 'completed' } });
    console.log(`💳 Transactions: ${transactionCount} (${completedTransactions} completed)`);
    
    // Coupons
    const couponCount = await prisma.coupon.count();
    const activeCoupons = await prisma.coupon.count({ where: { isActive: true } });
    console.log(`🎫 Coupons: ${couponCount} (${activeCoupons} active)`);
    
    // Chat Messages
    const chatCount = await prisma.chatMessage.count();
    console.log(`💬 Chat Messages: ${chatCount}`);
    
  } catch (error) {
    console.error('❌ Error getting data summary:', error.message);
  }
}

async function showRecentActivity() {
  try {
    console.log('\n🕒 RECENT ACTIVITY');
    console.log('==================');
    
    // Recent users
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { name: true, email: true, createdAt: true, role: true }
    });
    
    console.log('👥 Recent Users:');
    recentUsers.forEach(user => {
      const date = new Date(user.createdAt).toLocaleDateString();
      console.log(`  • ${user.name || 'No name'} (${user.email}) - ${user.role} - ${date}`);
    });
    
    // Recent bookings
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { name: true, email: true, status: true, totalAmount: true, createdAt: true }
    });
    
    console.log('\n📅 Recent Bookings:');
    recentBookings.forEach(booking => {
      const date = new Date(booking.createdAt).toLocaleDateString();
      const amount = booking.totalAmount ? `$${booking.totalAmount.toLocaleString()}` : 'N/A';
      console.log(`  • ${booking.name} (${booking.email}) - ${booking.status} - ${amount} - ${date}`);
    });
    
  } catch (error) {
    console.error('❌ Error getting recent activity:', error.message);
  }
}

async function showDatabaseStats() {
  try {
    console.log('\n📊 DATABASE STATISTICS');
    console.log('======================');
    
    // Database size
    const dbSize = await prisma.$queryRaw`
      SELECT 
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'DB Size in MB'
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `;
    console.log(`💾 Database Size: ${dbSize[0]['DB Size in MB']} MB`);
    
    // Table sizes
    const tableSizes = await prisma.$queryRaw`
      SELECT 
        table_name AS 'Table',
        ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)',
        table_rows AS 'Rows'
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      ORDER BY (data_length + index_length) DESC
    `;
    
    console.log('\n📋 Table Sizes:');
    tableSizes.forEach(table => {
      console.log(`  ${table.Table.padEnd(20)} ${table['Size (MB)']} MB (${table.Rows} rows)`);
    });
    
  } catch (error) {
    console.error('❌ Error getting database stats:', error.message);
  }
}

async function showIndexes() {
  try {
    console.log('\n🔍 INDEXES');
    console.log('==========');
    
    const indexes = await prisma.$queryRaw`
      SELECT 
        TABLE_NAME,
        INDEX_NAME,
        COLUMN_NAME,
        NON_UNIQUE
      FROM information_schema.STATISTICS 
      WHERE table_schema = DATABASE()
      ORDER BY TABLE_NAME, INDEX_NAME
    `;
    
    let currentTable = '';
    indexes.forEach(index => {
      if (index.TABLE_NAME !== currentTable) {
        currentTable = index.TABLE_NAME;
        console.log(`\n📁 ${currentTable}:`);
      }
      const unique = index.NON_UNIQUE === 0 ? 'UNIQUE' : 'INDEX';
      console.log(`  ${unique.padEnd(6)} ${index.INDEX_NAME} (${index.COLUMN_NAME})`);
    });
    
  } catch (error) {
    console.error('❌ Error getting indexes:', error.message);
  }
}

async function main() {
  try {
    await showDatabaseInfo();
    await showTablesOverview();
    await showDataSummary();
    await showRecentActivity();
    await showDatabaseStats();
    await showIndexes();
    
    console.log('\n🎉 Database overview completed!');
    console.log('💡 Use this information to understand your database structure and data.');
    
  } catch (error) {
    console.error('❌ Overview failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy overview
main().catch(console.error);
