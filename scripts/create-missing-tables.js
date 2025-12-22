const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createMissingTables() {
  try {
    console.log('🔄 Creating missing tables...\n');
    
    // Create Story table
    console.log('📝 Creating Story table...');
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS \`Story\` (
          \`id\` INT NOT NULL AUTO_INCREMENT,
          \`title\` VARCHAR(255) NOT NULL,
          \`slug\` VARCHAR(255) NOT NULL,
          \`content\` TEXT NOT NULL,
          \`excerpt\` TEXT,
          \`image\` VARCHAR(255),
          \`author\` VARCHAR(255) DEFAULT 'TravelGo AI',
          \`featured\` BOOLEAN NOT NULL DEFAULT FALSE,
          \`destinationId\` INT,
          \`category\` VARCHAR(255),
          \`tags\` JSON,
          \`likes\` INT NOT NULL DEFAULT 0,
          \`views\` INT NOT NULL DEFAULT 0,
          \`published\` BOOLEAN NOT NULL DEFAULT TRUE,
          \`publishedAt\` DATETIME,
          \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`Story_slug_key\` (\`slug\`),
          INDEX \`idx_destination\` (\`destinationId\`),
          INDEX \`idx_featured\` (\`featured\`),
          INDEX \`idx_published\` (\`published\`),
          FOREIGN KEY (\`destinationId\`) REFERENCES \`Destination\`(\`id\`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;
      console.log('✅ Story table created\n');
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
        console.log('ℹ️  Story table already exists\n');
      } else {
        throw error;
      }
    }
    
    // Create Blog table
    console.log('📰 Creating Blog table...');
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS \`Blog\` (
          \`id\` INT NOT NULL AUTO_INCREMENT,
          \`title\` VARCHAR(255) NOT NULL,
          \`slug\` VARCHAR(255) NOT NULL,
          \`excerpt\` TEXT,
          \`content\` TEXT NOT NULL,
          \`featuredImage\` VARCHAR(255),
          \`author\` VARCHAR(255) DEFAULT 'TravelGo Team',
          \`category\` VARCHAR(255),
          \`tags\` JSON,
          \`seoTitle\` VARCHAR(255),
          \`seoDescription\` TEXT,
          \`seoKeywords\` VARCHAR(255),
          \`published\` BOOLEAN NOT NULL DEFAULT FALSE,
          \`publishedAt\` DATETIME,
          \`views\` INT NOT NULL DEFAULT 0,
          \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`Blog_slug_key\` (\`slug\`),
          INDEX \`idx_published\` (\`published\`),
          INDEX \`idx_category\` (\`category\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;
      console.log('✅ Blog table created\n');
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
        console.log('ℹ️  Blog table already exists\n');
      } else {
        throw error;
      }
    }
    
    // Create Banner table
    console.log('🖼️  Creating Banner table...');
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS \`Banner\` (
          \`id\` INT NOT NULL AUTO_INCREMENT,
          \`name\` VARCHAR(255) NOT NULL,
          \`imageUrl\` VARCHAR(255) NOT NULL,
          \`linkUrl\` VARCHAR(255),
          \`description\` TEXT,
          \`position\` VARCHAR(100) NOT NULL,
          \`isActive\` BOOLEAN NOT NULL DEFAULT TRUE,
          \`startDate\` DATETIME,
          \`endDate\` DATETIME,
          \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          INDEX \`idx_position\` (\`position\`),
          INDEX \`idx_active\` (\`isActive\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;
      console.log('✅ Banner table created\n');
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
        console.log('ℹ️  Banner table already exists\n');
      } else {
        throw error;
      }
    }
    
    // Create EmailTemplate table
    console.log('📧 Creating EmailTemplate table...');
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS \`EmailTemplate\` (
          \`id\` INT NOT NULL AUTO_INCREMENT,
          \`name\` VARCHAR(255) NOT NULL,
          \`subject\` VARCHAR(255) NOT NULL,
          \`body\` TEXT NOT NULL,
          \`variables\` JSON,
          \`isActive\` BOOLEAN NOT NULL DEFAULT TRUE,
          \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`EmailTemplate_name_key\` (\`name\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;
      console.log('✅ EmailTemplate table created\n');
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
        console.log('ℹ️  EmailTemplate table already exists\n');
      } else {
        throw error;
      }
    }
    
    // Create ActivityLog table
    console.log('📋 Creating ActivityLog table...');
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS \`ActivityLog\` (
          \`id\` INT NOT NULL AUTO_INCREMENT,
          \`userId\` INT,
          \`action\` VARCHAR(100) NOT NULL,
          \`entityType\` VARCHAR(100) NOT NULL,
          \`entityId\` INT,
          \`description\` TEXT NOT NULL,
          \`ipAddress\` VARCHAR(45),
          \`userAgent\` TEXT,
          \`metadata\` JSON,
          \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          INDEX \`idx_user\` (\`userId\`),
          INDEX \`idx_action\` (\`action\`),
          INDEX \`idx_entity\` (\`entityType\`, \`entityId\`),
          INDEX \`idx_created\` (\`createdAt\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;
      console.log('✅ ActivityLog table created\n');
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
        console.log('ℹ️  ActivityLog table already exists\n');
      } else {
        throw error;
      }
    }
    
    // Create NewsletterSubscription table (if not exists)
    console.log('📬 Checking NewsletterSubscription table...');
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS \`NewsletterSubscription\` (
          \`id\` INT NOT NULL AUTO_INCREMENT,
          \`email\` VARCHAR(255) NOT NULL,
          \`subscribed\` BOOLEAN NOT NULL DEFAULT TRUE,
          \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`NewsletterSubscription_email_key\` (\`email\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;
      console.log('✅ NewsletterSubscription table created\n');
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
        console.log('ℹ️  NewsletterSubscription table already exists\n');
      } else {
        throw error;
      }
    }
    
    // Create ChatSession table
    console.log('💬 Creating ChatSession table...');
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS \`ChatSession\` (
          \`id\` INT NOT NULL AUTO_INCREMENT,
          \`userId\` INT,
          \`sessionId\` VARCHAR(255) NOT NULL,
          \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`ChatSession_sessionId_key\` (\`sessionId\`),
          INDEX \`idx_user\` (\`userId\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;
      console.log('✅ ChatSession table created\n');
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
        console.log('ℹ️  ChatSession table already exists\n');
      } else {
        throw error;
      }
    }
    
    // Create ChatMessage table
    console.log('💭 Creating ChatMessage table...');
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS \`ChatMessage\` (
          \`id\` INT NOT NULL AUTO_INCREMENT,
          \`sessionId\` INT NOT NULL,
          \`role\` VARCHAR(50) NOT NULL,
          \`content\` TEXT NOT NULL,
          \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          INDEX \`idx_session\` (\`sessionId\`),
          INDEX \`idx_created\` (\`createdAt\`),
          FOREIGN KEY (\`sessionId\`) REFERENCES \`ChatSession\`(\`id\`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;
      console.log('✅ ChatMessage table created\n');
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
        console.log('ℹ️  ChatMessage table already exists\n');
      } else {
        throw error;
      }
    }
    
    console.log('✅ All missing tables created successfully!');
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Some tables already exist, skipping...');
    } else {
      console.error('❌ Error creating tables:', error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

createMissingTables();

