const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixReviewTable() {
  try {
    console.log('🔄 Fixing Review table columns...\n');
    
    // Check existing columns
    const columns = await prisma.$queryRaw`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'Review'
      ORDER BY COLUMN_NAME
    `;
    
    console.log('📋 Existing columns:', columns.map(c => c.COLUMN_NAME).join(', '));
    
    const existingColumns = columns.map(c => c.COLUMN_NAME);
    
    // Add images column if missing
    if (!existingColumns.includes('images')) {
      console.log('\n📝 Adding images column...');
      await prisma.$executeRaw`
        ALTER TABLE \`Review\` 
        ADD COLUMN \`images\` JSON NULL
        AFTER \`comment\`;
      `;
      console.log('✅ images column added');
    } else {
      console.log('\nℹ️  images column already exists');
    }
    
    // Add approved column if missing
    if (!existingColumns.includes('approved')) {
      console.log('📝 Adding approved column...');
      await prisma.$executeRaw`
        ALTER TABLE \`Review\` 
        ADD COLUMN \`approved\` BOOLEAN NOT NULL DEFAULT FALSE
        AFTER \`images\`;
      `;
      console.log('✅ approved column added');
    } else {
      console.log('ℹ️  approved column already exists');
    }
    
    // Add helpfulCount column if missing
    if (!existingColumns.includes('helpfulCount')) {
      console.log('📝 Adding helpfulCount column...');
      await prisma.$executeRaw`
        ALTER TABLE \`Review\` 
        ADD COLUMN \`helpfulCount\` INT NOT NULL DEFAULT 0
        AFTER \`approved\`;
      `;
      console.log('✅ helpfulCount column added');
    } else {
      console.log('ℹ️  helpfulCount column already exists');
    }
    
    console.log('\n✅ Review table fixed successfully!');
    
  } catch (error) {
    if (error.message.includes('Duplicate column name') || error.message.includes('already exists')) {
      console.log('ℹ️  Some columns already exist');
    } else {
      console.error('❌ Error:', error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

fixReviewTable();

