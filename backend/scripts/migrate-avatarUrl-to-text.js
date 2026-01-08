// Script to migrate avatarUrl column from VARCHAR(191) to TEXT
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateAvatarUrl() {
  try {
    console.log('🔄 Migrating avatarUrl column from VARCHAR(191) to TEXT...\n');

    // Check current column type
    const currentColumn = await prisma.$queryRaw`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'User' 
      AND COLUMN_NAME = 'avatarUrl'
    `;

    if (currentColumn.length === 0) {
      console.log('⚠️  avatarUrl column not found. Creating it as TEXT...');
      await prisma.$executeRaw`
        ALTER TABLE \`User\` 
        ADD COLUMN \`avatarUrl\` TEXT NULL
      `;
      console.log('✅ Created avatarUrl column as TEXT');
    } else {
      const col = currentColumn[0];
      console.log(`📊 Current column type: ${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''}`);
      
      if (col.DATA_TYPE === 'text' || col.DATA_TYPE === 'longtext' || col.DATA_TYPE === 'mediumtext') {
        console.log('✅ Column is already TEXT type. No migration needed.');
      } else {
        // Run migration
        console.log('🔄 Altering column to TEXT...');
        await prisma.$executeRaw`
          ALTER TABLE \`User\` 
          MODIFY COLUMN \`avatarUrl\` TEXT NULL
        `;
        console.log('✅ Migration completed successfully!');
      }
    }

    // Verify the change
    const updatedColumn = await prisma.$queryRaw`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'User' 
      AND COLUMN_NAME = 'avatarUrl'
    `;

    if (updatedColumn.length > 0) {
      const col = updatedColumn[0];
      console.log(`\n✅ Verification: avatarUrl is now ${col.DATA_TYPE.toUpperCase()}`);
    }

    console.log('\n✅ Migration script completed!');
  } catch (error) {
    console.error('\n❌ Migration failed!');
    console.error('Error:', error.message);
    if (error.code === 'P2000') {
      console.error('   Database connection or permission error');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateAvatarUrl();

