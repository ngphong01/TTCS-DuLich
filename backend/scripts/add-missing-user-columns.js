const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addMissingColumns() {
  try {
    console.log('🔄 Checking and adding missing User table columns...\n');
    
    // Get all columns from database
    const dbColumns = await prisma.$queryRaw`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'User'
      ORDER BY COLUMN_NAME
    `;
    
    const existingColumns = dbColumns.map(c => c.COLUMN_NAME);
    console.log('📋 Existing columns:', existingColumns.join(', '));
    
    // List of columns that should exist based on schema
    const requiredColumns = [
      { name: 'phoneVerified', type: 'BOOLEAN', default: 'FALSE', after: 'phone' },
      { name: 'phoneVerificationCode', type: 'VARCHAR(191)', default: 'NULL', after: 'phoneVerified' },
      { name: 'phoneVerificationExpiry', type: 'DATETIME(3)', default: 'NULL', after: 'phoneVerificationCode' },
      { name: 'dateOfBirth', type: 'DATETIME(3)', default: 'NULL', after: 'referralCode' },
      { name: 'twoFactorEnabled', type: 'BOOLEAN', default: 'FALSE', after: 'phoneVerificationExpiry' },
      { name: 'twoFactorSecret', type: 'VARCHAR(191)', default: 'NULL', after: 'twoFactorEnabled' },
      { name: 'pushSubscription', type: 'JSON', default: 'NULL', after: 'twoFactorSecret' },
    ];
    
    let addedCount = 0;
    
    for (const col of requiredColumns) {
      if (existingColumns.includes(col.name)) {
        console.log(`ℹ️  Column ${col.name} already exists, skipping...`);
        continue;
      }
      
      try {
        console.log(`📝 Adding column ${col.name}...`);
        
        let sql = `ALTER TABLE \`User\` ADD COLUMN \`${col.name}\` ${col.type}`;
        
        if (col.default !== 'NULL') {
          sql += ` NOT NULL DEFAULT ${col.default}`;
        } else {
          sql += ` NULL`;
        }
        
        if (col.after) {
          // Check if after column exists
          if (existingColumns.includes(col.after)) {
            sql += ` AFTER \`${col.after}\``;
          }
        }
        
        await prisma.$executeRawUnsafe(sql);
        console.log(`✅ Column ${col.name} added successfully!`);
        addedCount++;
        
        // Add to existing columns list for next iterations
        existingColumns.push(col.name);
        
      } catch (error) {
        if (error.message.includes('Duplicate column name') || error.message.includes('already exists')) {
          console.log(`ℹ️  Column ${col.name} already exists, skipping...`);
        } else {
          console.error(`❌ Error adding column ${col.name}:`, error.message);
          // Continue with next column
        }
      }
    }
    
    if (addedCount > 0) {
      console.log(`\n✅ Added ${addedCount} column(s) successfully!`);
    } else {
      console.log(`\n✅ All required columns already exist!`);
    }
    
    console.log('\n✅ Done! Please restart your server.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addMissingColumns();

