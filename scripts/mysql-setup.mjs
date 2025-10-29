#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

console.log('🚀 MySQL Setup Script');
console.log('====================');

async function checkMySQLConnection() {
  try {
    console.log('📡 Testing MySQL connection...');
    await prisma.$connect();
    console.log('✅ MySQL connection successful!');
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    return false;
  }
}

async function createDatabase() {
  try {
    console.log('🗄️ Creating database if not exists...');
    
    // Extract database name from DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL not found in environment variables');
    }
    
    const url = new URL(dbUrl);
    const dbName = url.pathname.substring(1); // Remove leading slash
    
    // Connect to MySQL server (without database)
    const serverUrl = dbUrl.replace(`/${dbName}`, '');
    const serverPrisma = new PrismaClient({
      datasources: {
        db: {
          url: serverUrl
        }
      }
    });
    
    // Create database
    await serverPrisma.$executeRawUnsafe(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' created successfully!`);
    
    await serverPrisma.$disconnect();
  } catch (error) {
    console.error('❌ Database creation failed:', error.message);
  }
}

async function runMigrations() {
  try {
    console.log('🔄 Running Prisma migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

async function generatePrismaClient() {
  try {
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated successfully!');
  } catch (error) {
    console.error('❌ Prisma client generation failed:', error.message);
  }
}

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');
    
    // Check if destinations exist
    const destinationCount = await prisma.destination.count();
    
    if (destinationCount === 0) {
      console.log('📝 No destinations found, seeding sample data...');
      
      const sampleDestinations = [
        {
          slug: 'ha-long-bay',
          name: 'Vịnh Hạ Long',
          description: 'Di sản thế giới với hàng nghìn đảo đá vôi tuyệt đẹp',
          image: '/images/ha-long-bay.jpg',
          rating: 4.8,
          price: 2500000,
          country: 'Vietnam',
          tags: 'nature,unesco,boat'
        },
        {
          slug: 'hoi-an',
          name: 'Hội An',
          description: 'Phố cổ đẹp như tranh với kiến trúc cổ kính',
          image: '/images/hoi-an.jpg',
          rating: 4.7,
          price: 1800000,
          country: 'Vietnam',
          tags: 'culture,ancient,lantern'
        },
        {
          slug: 'sapa',
          name: 'Sa Pa',
          description: 'Vùng núi cao với ruộng bậc thang và văn hóa dân tộc',
          image: '/images/sapa.jpg',
          rating: 4.6,
          price: 2200000,
          country: 'Vietnam',
          tags: 'mountain,rice-terrace,ethnic'
        }
      ];
      
      await prisma.destination.createMany({
        data: sampleDestinations
      });
      
      console.log('✅ Sample destinations created!');
    } else {
      console.log(`✅ Database already has ${destinationCount} destinations`);
    }
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
  }
}

async function optimizeMySQL() {
  try {
    console.log('⚡ Optimizing MySQL configuration...');
    
    // Add indexes for better performance
    const optimizations = [
      'CREATE INDEX IF NOT EXISTS idx_user_email ON User(email)',
      'CREATE INDEX IF NOT EXISTS idx_destination_slug ON Destination(slug)',
      'CREATE INDEX IF NOT EXISTS idx_booking_status ON Booking(status)',
      'CREATE INDEX IF NOT EXISTS idx_transaction_status ON Transaction(status)',
      'CREATE INDEX IF NOT EXISTS idx_coupon_code ON Coupon(code)',
      'CREATE INDEX IF NOT EXISTS idx_coupon_active ON Coupon(isActive)'
    ];
    
    for (const query of optimizations) {
      try {
        await prisma.$executeRawUnsafe(query);
      } catch (error) {
        // Index might already exist, continue
        console.log(`ℹ️ Index optimization: ${error.message}`);
      }
    }
    
    console.log('✅ MySQL optimization completed!');
  } catch (error) {
    console.error('❌ MySQL optimization failed:', error.message);
  }
}

async function main() {
  try {
    // Step 1: Check connection
    const connected = await checkMySQLConnection();
    if (!connected) {
      console.log('💡 Please check your DATABASE_URL in .env.local');
      console.log('💡 Make sure MySQL server is running');
      console.log('💡 Example: DATABASE_URL="mysql://root:password@localhost:3306/nextjs_starter"');
      return;
    }
    
    // Step 2: Create database
    await createDatabase();
    
    // Step 3: Generate Prisma client
    await generatePrismaClient();
    
    // Step 4: Run migrations
    await runMigrations();
    
    // Step 5: Seed database
    await seedDatabase();
    
    // Step 6: Optimize MySQL
    await optimizeMySQL();
    
    console.log('\n🎉 MySQL setup completed successfully!');
    console.log('🚀 You can now run: npm run dev');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
main().catch(console.error);
