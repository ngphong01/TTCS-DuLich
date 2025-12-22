const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addEmailVerifiedColumn() {
  try {
    console.log('🔄 Adding emailVerified column to User table...\n');
    
    // Check if column exists
    const columns = await prisma.$queryRaw`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'User' 
      AND COLUMN_NAME = 'emailVerified'
    `;
    
    if (Array.isArray(columns) && columns.length > 0) {
      console.log('ℹ️  Column emailVerified already exists, skipping...');
      return;
    }
    
    console.log('📝 Adding emailVerified column...');
    
    // Add column (MySQL doesn't support IF NOT EXISTS in ALTER TABLE)
    try {
      await prisma.$executeRaw`
        ALTER TABLE \`User\` 
        ADD COLUMN \`emailVerified\` BOOLEAN NOT NULL DEFAULT FALSE
        AFTER \`resetTokenExpiry\`;
      `;
    } catch (error) {
      if (error.message.includes('Duplicate column name') || error.message.includes('already exists')) {
        console.log('ℹ️  Column already exists, skipping...');
        return;
      }
      throw error;
    }
    
    console.log('✅ emailVerified column added successfully!');
    
    // Update existing users
    console.log('📝 Updating existing users...');
    await prisma.$executeRaw`
      UPDATE \`User\` 
      SET \`emailVerified\` = FALSE 
      WHERE \`emailVerified\` IS NULL;
    `;
    
    console.log('✅ All existing users updated!');
    console.log('\n✅ Done! Please restart your server.');
    
  } catch (error) {
    if (error.message.includes('Duplicate column name') || error.message.includes('already exists')) {
      console.log('ℹ️  Column already exists, skipping...');
    } else {
      console.error('❌ Error:', error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

addEmailVerifiedColumn();

