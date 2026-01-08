// Comprehensive script to verify and fix login system
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function verifyLoginSystem() {
  try {
    console.log('🔍 Verifying Login System...\n');

    // 1. Check database connection
    console.log('1️⃣  Checking database connection...');
    await prisma.$connect();
    console.log('   ✅ Database connected\n');

    // 2. Check User table structure
    console.log('2️⃣  Checking User table structure...');
    const columns = await prisma.$queryRaw`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'User'
      ORDER BY ORDINAL_POSITION
    `;
    
    const requiredColumns = ['id', 'email', 'passwordHash', 'name', 'role', 'avatarUrl'];
    const existingColumns = columns.map(c => c.COLUMN_NAME);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('   ⚠️  Missing columns:', missingColumns.join(', '));
    } else {
      console.log('   ✅ All required columns exist');
    }
    
    // Check avatarUrl type
    const avatarUrlCol = columns.find(c => c.COLUMN_NAME === 'avatarUrl');
    if (avatarUrlCol) {
      if (avatarUrlCol.DATA_TYPE === 'text' || avatarUrlCol.DATA_TYPE === 'longtext') {
        console.log('   ✅ avatarUrl is TEXT type');
      } else {
        console.log(`   ⚠️  avatarUrl is ${avatarUrlCol.DATA_TYPE} (should be TEXT)`);
      }
    }
    console.log('');

    // 3. Check for admin user
    console.log('3️⃣  Checking admin user...');
    const adminEmail = 'phong@triennguyen.com';
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
      }
    });

    if (!admin) {
      console.log(`   ⚠️  Admin user not found: ${adminEmail}`);
      console.log('   💡 Run: node scripts/fix-admin-password.js');
    } else {
      console.log(`   ✅ Admin user found: ${admin.email} (${admin.role})`);
      
      // Test password
      const testPassword = 'Phong@2004';
      const passwordMatch = await bcrypt.compare(testPassword, admin.passwordHash);
      if (passwordMatch) {
        console.log('   ✅ Admin password is correct');
      } else {
        console.log('   ⚠️  Admin password mismatch');
        console.log('   💡 Run: node scripts/fix-admin-password.js');
      }
    }
    console.log('');

    // 4. Check for users with invalid password hashes
    console.log('4️⃣  Checking password hashes...');
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
      take: 10, // Check first 10 users
    });

    let invalidHashes = 0;
    for (const user of allUsers) {
      if (!user.passwordHash || user.passwordHash.length < 20) {
        invalidHashes++;
        console.log(`   ⚠️  Invalid hash for user: ${user.email} (length: ${user.passwordHash?.length || 0})`);
      }
    }

    if (invalidHashes === 0) {
      console.log(`   ✅ All ${allUsers.length} checked users have valid password hashes`);
    } else {
      console.log(`   ⚠️  Found ${invalidHashes} users with invalid password hashes`);
    }
    console.log('');

    // 5. Check OAuth configuration
    console.log('5️⃣  Checking OAuth configuration...');
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const facebookAppId = process.env.FACEBOOK_APP_ID;
    const facebookAppSecret = process.env.FACEBOOK_APP_SECRET;

    if (googleClientId && googleClientSecret) {
      console.log('   ✅ Google OAuth configured');
    } else {
      console.log('   ⚠️  Google OAuth not configured');
    }

    if (facebookAppId && facebookAppSecret) {
      console.log('   ✅ Facebook OAuth configured');
    } else {
      console.log('   ⚠️  Facebook OAuth not configured');
    }
    console.log('');

    // 6. Test login flow simulation
    console.log('6️⃣  Testing login flow...');
    if (admin) {
      const testPassword = 'Phong@2004';
      const passwordMatch = await bcrypt.compare(testPassword, admin.passwordHash);
      
      if (passwordMatch) {
        console.log('   ✅ Login flow test: SUCCESS');
        console.log(`   📧 Email: ${admin.email}`);
        console.log('   🔑 Password: Phong@2004');
      } else {
        console.log('   ❌ Login flow test: FAILED (password mismatch)');
      }
    } else {
      console.log('   ⚠️  Cannot test login flow (admin user not found)');
    }
    console.log('');

    // 7. Check for common issues
    console.log('7️⃣  Checking for common issues...');
    const issues = [];

    // Check JWT_SECRET
    if (!process.env.JWT_SECRET) {
      issues.push('JWT_SECRET not set in .env');
    }

    // Check DATABASE_URL
    if (!process.env.DATABASE_URL) {
      issues.push('DATABASE_URL not set in .env');
    }

    // Check for users without passwordHash (OAuth users should have one)
    // Note: OAuth users should still have a passwordHash (random hash for security)
    // This check is informational only

    if (issues.length === 0) {
      console.log('   ✅ No common issues found');
    } else {
      console.log('   ⚠️  Found issues:');
      issues.forEach(issue => console.log(`      - ${issue}`));
    }
    console.log('');

    // Summary
    console.log('📊 Summary:');
    console.log('   ✅ Database connection: OK');
    console.log(`   ${missingColumns.length === 0 ? '✅' : '⚠️ '} Required columns: ${missingColumns.length === 0 ? 'All present' : `${missingColumns.length} missing`}`);
    console.log(`   ${admin ? '✅' : '⚠️ '} Admin user: ${admin ? 'Found' : 'Not found'}`);
    console.log(`   ${invalidHashes === 0 ? '✅' : '⚠️ '} Password hashes: ${invalidHashes === 0 ? 'All valid' : `${invalidHashes} invalid`}`);
    console.log('');

    if (missingColumns.length === 0 && admin && invalidHashes === 0) {
      console.log('✅ Login system is ready!');
    } else {
      console.log('⚠️  Some issues found. Please fix them before testing login.');
    }

  } catch (error) {
    console.error('\n❌ Verification failed!');
    console.error('Error:', error.message);
    if (error.code === 'P2000') {
      console.error('   Database connection or permission error');
    } else if (error.code === 'P2022') {
      console.error('   Schema mismatch - some columns may not exist');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyLoginSystem();

