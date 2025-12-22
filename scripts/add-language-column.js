// scripts/add-language-column.js
// Add language column to User table for i18n support

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addLanguageColumn() {
  try {
    console.log('🌍 Adding language column to User table...');

    // Check if column exists
    const result = await prisma.$queryRaw`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'User' 
      AND COLUMN_NAME = 'language'
    `;

    if (result.length > 0) {
      console.log('✅ Language column already exists');
      return;
    }

    // Add language column
    await prisma.$executeRaw`
      ALTER TABLE User 
      ADD COLUMN language VARCHAR(10) DEFAULT 'en' 
      AFTER pushSubscription
    `;

    console.log('✅ Language column added successfully');

    // Update existing users to have default language
    const updated = await prisma.user.updateMany({
      where: { language: null },
      data: { language: 'en' },
    });

    console.log(`✅ Updated ${updated.count} users with default language 'en'`);

  } catch (error) {
    console.error('❌ Error adding language column:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addLanguageColumn()
  .then(() => {
    console.log('✅ Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });

