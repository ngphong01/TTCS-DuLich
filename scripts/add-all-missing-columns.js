const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addAllMissingColumns() {
  try {
    console.log('🔄 Adding all missing User table columns...\n');
    
    const columnsToAdd = [
      {
        name: 'phoneVerified',
        sql: `ALTER TABLE \`User\` ADD COLUMN \`phoneVerified\` BOOLEAN NOT NULL DEFAULT FALSE`
      },
      {
        name: 'phoneVerificationCode',
        sql: `ALTER TABLE \`User\` ADD COLUMN \`phoneVerificationCode\` VARCHAR(191) NULL`
      },
      {
        name: 'phoneVerificationExpiry',
        sql: `ALTER TABLE \`User\` ADD COLUMN \`phoneVerificationExpiry\` DATETIME(3) NULL`
      },
      {
        name: 'dateOfBirth',
        sql: `ALTER TABLE \`User\` ADD COLUMN \`dateOfBirth\` DATETIME(3) NULL`
      },
      {
        name: 'twoFactorEnabled',
        sql: `ALTER TABLE \`User\` ADD COLUMN \`twoFactorEnabled\` BOOLEAN NOT NULL DEFAULT FALSE`
      },
      {
        name: 'twoFactorSecret',
        sql: `ALTER TABLE \`User\` ADD COLUMN \`twoFactorSecret\` VARCHAR(191) NULL`
      },
      {
        name: 'pushSubscription',
        sql: `ALTER TABLE \`User\` ADD COLUMN \`pushSubscription\` JSON NULL`
      },
    ];
    
    let addedCount = 0;
    
    for (const col of columnsToAdd) {
      try {
        // Check if column exists
        const exists = await prisma.$queryRaw`
          SELECT COUNT(*) as count
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'User' 
          AND COLUMN_NAME = ${col.name}
        `;
        
        if (exists[0].count > 0) {
          console.log(`ℹ️  Column ${col.name} already exists, skipping...`);
          continue;
        }
        
        console.log(`📝 Adding column ${col.name}...`);
        await prisma.$executeRawUnsafe(col.sql);
        console.log(`✅ Column ${col.name} added!`);
        addedCount++;
        
      } catch (error) {
        if (error.message.includes('Duplicate column name') || error.message.includes('already exists')) {
          console.log(`ℹ️  Column ${col.name} already exists, skipping...`);
        } else {
          console.error(`❌ Error adding ${col.name}:`, error.message);
        }
      }
    }
    
    console.log(`\n✅ Process complete! Added ${addedCount} column(s).`);
    console.log('✅ Please restart your server.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addAllMissingColumns();

