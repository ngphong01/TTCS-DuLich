const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createPromoTables() {
  try {
    console.log('🔄 Creating PromoCode and PromoCodeUsage tables...');
    
    // Create PromoCode table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`PromoCode\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`code\` VARCHAR(255) NOT NULL UNIQUE,
        \`description\` TEXT,
        \`discountType\` VARCHAR(50) NOT NULL DEFAULT 'PERCENTAGE',
        \`discountValue\` INT NOT NULL,
        \`minAmount\` INT NOT NULL DEFAULT 0,
        \`maxDiscount\` INT,
        \`usageLimit\` INT,
        \`usedCount\` INT NOT NULL DEFAULT 0,
        \`validFrom\` DATETIME NOT NULL,
        \`validUntil\` DATETIME NOT NULL,
        \`active\` BOOLEAN NOT NULL DEFAULT TRUE,
        \`applicableTo\` JSON,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_code\` (\`code\`),
        INDEX \`idx_active\` (\`active\`),
        INDEX \`idx_valid_dates\` (\`validFrom\`, \`validUntil\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    console.log('✅ PromoCode table created');
    
    // Create PromoCodeUsage table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`PromoCodeUsage\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`promoCodeId\` INT NOT NULL,
        \`userId\` INT,
        \`bookingId\` INT,
        \`amount\` INT NOT NULL,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        FOREIGN KEY (\`promoCodeId\`) REFERENCES \`PromoCode\`(\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE SET NULL,
        INDEX \`idx_promo_code\` (\`promoCodeId\`),
        INDEX \`idx_user\` (\`userId\`),
        INDEX \`idx_booking\` (\`bookingId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    console.log('✅ PromoCodeUsage table created');
    console.log('✅ All tables created successfully!');
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Tables already exist, skipping...');
    } else {
      console.error('❌ Error creating tables:', error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

createPromoTables();

