#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import readline from 'readline';

const prisma = new PrismaClient();

console.log('🚀 MySQL Connection Test Script');
console.log('===============================');

// Tạo interface để đọc input từ user
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function testMySQLConnection() {
  try {
    console.log('📡 Testing MySQL connection...');
    await prisma.$connect();
    console.log('✅ MySQL connection successful!');
    
    // Test basic query
    const result = await prisma.$queryRaw`SELECT VERSION() as version`;
    console.log(`✅ MySQL Version: ${result[0].version}`);
    
    // Test database info
    const dbInfo = await prisma.$queryRaw`SELECT DATABASE() as current_db`;
    console.log(`✅ Current Database: ${dbInfo[0].current_db}`);
    
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    return false;
  }
}

async function createDatabaseIfNotExists() {
  try {
    console.log('🗄️ Checking database...');
    
    // Lấy tên database từ DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL not found in environment variables');
    }
    
    const url = new URL(dbUrl);
    const dbName = url.pathname.substring(1); // Remove leading slash
    
    // Kiểm tra database có tồn tại không
    const databases = await prisma.$queryRaw`SHOW DATABASES`;
    const dbExists = databases.some(db => db.Database === dbName);
    
    if (!dbExists) {
      console.log(`📝 Creating database: ${dbName}`);
      await prisma.$executeRawUnsafe(`CREATE DATABASE \`${dbName}\``);
      console.log(`✅ Database '${dbName}' created successfully!`);
    } else {
      console.log(`✅ Database '${dbName}' already exists`);
    }
    
  } catch (error) {
    console.error('❌ Database creation failed:', error.message);
  }
}

async function showTables() {
  try {
    console.log('📊 Checking tables...');
    const tables = await prisma.$queryRaw`SHOW TABLES`;
    
    if (tables.length === 0) {
      console.log('ℹ️ No tables found. Run migrations first:');
      console.log('   npx prisma migrate dev --name init');
    } else {
      console.log('✅ Tables found:');
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`   - ${tableName}`);
      });
    }
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  }
}

async function main() {
  try {
    console.log('🔧 MySQL Setup Helper');
    console.log('=====================\n');
    
    // Kiểm tra DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.log('❌ DATABASE_URL not found!');
      console.log('💡 Please create .env.local file with:');
      console.log('   DATABASE_URL="mysql://username:password@localhost:3306/database_name"');
      return;
    }
    
    console.log(`📋 Current DATABASE_URL: ${dbUrl.replace(/\/\/.*@/, '//***:***@')}`);
    
    // Test connection
    const connected = await testMySQLConnection();
    if (!connected) {
      console.log('\n💡 Connection failed. Please check:');
      console.log('1. MySQL server is running');
      console.log('2. Username and password are correct');
      console.log('3. Database exists or can be created');
      console.log('4. Port 3306 is accessible');
      return;
    }
    
    console.log('');
    
    // Create database if needed
    await createDatabaseIfNotExists();
    console.log('');
    
    // Show tables
    await showTables();
    console.log('');
    
    console.log('🎉 MySQL is ready!');
    console.log('🚀 You can now run: npm run dev');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Chạy script
main().catch(console.error);
