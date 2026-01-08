// Script to check database connection and tables
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...\n');
    await prisma.$connect();
    console.log('✅ Database connected successfully!\n');

    // Check all tables
    console.log('📊 Checking tables...');
    const tables = await prisma.$queryRaw`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'travelgo'
      ORDER BY TABLE_NAME
    `;
    
    console.log(`\n✅ Found ${tables.length} tables:`);
    tables.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.TABLE_NAME}`);
    });

    // Check User table
    console.log('\n👥 Checking User table...');
    const userCount = await prisma.user.count();
    console.log(`   Total users: ${userCount}`);
    
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, name: true, role: true }
    });
    console.log(`   Admin users: ${admins.length}`);
    if (admins.length > 0) {
      console.log('   Admin accounts:');
      admins.forEach(admin => {
        console.log(`      - ${admin.email} (${admin.name})`);
      });
    }

    // Check other tables
    console.log('\n📦 Checking other tables...');
    const destinationCount = await prisma.destination.count();
    const bookingCount = await prisma.booking.count();
    const paymentCount = await prisma.payment.count();
    const reviewCount = await prisma.review.count();
    const wishlistCount = await prisma.wishlist.count();
    const supportCount = await prisma.supportTicket.count();
    const categoryCount = await prisma.category.count();

    console.log(`   Categories: ${categoryCount}`);
    console.log(`   Destinations: ${destinationCount}`);
    console.log(`   Bookings: ${bookingCount}`);
    console.log(`   Payments: ${paymentCount}`);
    console.log(`   Reviews: ${reviewCount}`);
    console.log(`   Wishlist items: ${wishlistCount}`);
    console.log(`   Support tickets: ${supportCount}`);

    // Check User schema
    console.log('\n🔍 Checking User schema...');
    const userSchema = await prisma.$queryRaw`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'travelgo' AND TABLE_NAME = 'User'
      ORDER BY ORDINAL_POSITION
    `;
    console.log('   User table columns:');
    userSchema.forEach(col => {
      console.log(`      - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    const hasAvatarUrl = userSchema.some(col => col.COLUMN_NAME === 'avatarUrl');
    const hasSettings = userSchema.some(col => col.COLUMN_NAME === 'settings');
    
    console.log(`\n   ✅ avatarUrl column: ${hasAvatarUrl ? 'EXISTS' : 'MISSING'}`);
    console.log(`   ✅ settings column: ${hasSettings ? 'EXISTS' : 'MISSING'}`);

    console.log('\n✅ Database check completed successfully!');
    console.log('\n📝 Summary:');
    console.log(`   - Database: ${process.env.DATABASE_URL?.split('@')[1] || 'N/A'}`);
    console.log(`   - Total tables: ${tables.length}`);
    console.log(`   - Total users: ${userCount} (${admins.length} admins)`);
    console.log(`   - Schema: ${hasAvatarUrl && hasSettings ? 'UP TO DATE ✅' : 'NEEDS UPDATE ⚠️'}`);

  } catch (error) {
    console.error('\n❌ Database check failed!');
    console.error('Error:', error.message);
    if (error.code === 'P2002') {
      console.error('   Duplicate entry error');
    } else if (error.code === 'P2025') {
      console.error('   Record not found');
    } else if (error.message.includes('connect')) {
      console.error('   Connection error - Check MySQL is running');
      console.error('   Check DATABASE_URL in .env file');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();

