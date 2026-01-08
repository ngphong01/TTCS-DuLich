const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addReviewImagesColumn() {
  try {
    console.log('🔄 Checking Review table for images column...');
    
    // Check if column exists
    const columns = await prisma.$queryRaw`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'Review' 
      AND COLUMN_NAME = 'images'
    `;
    
    if (Array.isArray(columns) && columns.length > 0) {
      console.log('ℹ️  Column images already exists, skipping...');
      return;
    }
    
    console.log('📝 Adding images column to Review table...');
    
    await prisma.$executeRaw`
      ALTER TABLE \`Review\` 
      ADD COLUMN \`images\` JSON NULL
      AFTER \`comment\`;
    `;
    
    console.log('✅ Review.images column added successfully!');
    
  } catch (error) {
    if (error.message.includes('Duplicate column name') || error.message.includes('already exists')) {
      console.log('ℹ️  Column already exists, skipping...');
    } else {
      console.error('❌ Error adding column:', error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

addReviewImagesColumn();

