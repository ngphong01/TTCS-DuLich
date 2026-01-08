#!/usr/bin/env node

/**
 * TravelGo Database Setup Script
 * Automatically sets up database with seed data
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '123456';
const DB_NAME = 'travelgo';

console.log('🚀 TravelGo Database Setup');
console.log('==========================\n');

// Check if MySQL is available
function checkMySQL() {
  try {
    execSync(`mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} -e "SELECT 1"`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Create database
function createDatabase() {
  console.log(`📦 Creating database '${DB_NAME}'...`);
  try {
    execSync(
      `mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"`,
      { stdio: 'inherit' }
    );
    console.log('✅ Database created\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to create database');
    return false;
  }
}

// Import SQL file
function importSQL() {
  const sqlFile = path.join(__dirname, '..', 'database', 'travelgo_complete.sql');
  
  if (!fs.existsSync(sqlFile)) {
    console.log('⚠️  SQL file not found. Using Prisma migrate instead...\n');
    return false;
  }

  console.log('📥 Importing database from travelgo_complete.sql...');
  try {
    execSync(
      `mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} ${DB_NAME} < "${sqlFile}"`,
      { stdio: 'inherit' }
    );
    console.log('✅ Database imported successfully\n');

    // Import extended data if exists
    const extendedFile = path.join(__dirname, '..', 'database', 'travelgo_extended_data.sql');
    if (fs.existsSync(extendedFile)) {
      console.log('📥 Importing extended data...');
      try {
        execSync(
          `mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} ${DB_NAME} < "${extendedFile}"`,
          { stdio: 'inherit' }
        );
        console.log('✅ Extended data imported\n');
      } catch (error) {
        console.log('⚠️  Extended data import had issues (may already exist)\n');
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Failed to import SQL file');
    return false;
  }
}

// Use Prisma
function usePrisma() {
  console.log('📦 Running Prisma migrations...');
  try {
    execSync('npm run prisma:migrate', { stdio: 'inherit' });
    console.log('✅ Prisma migrations completed\n');

    console.log('🌱 Running Prisma seed...');
    try {
      execSync('npm run prisma:seed', { stdio: 'inherit' });
      console.log('✅ Seed completed\n');
    } catch (error) {
      console.log('⚠️  Seed had issues (may already exist)\n');
    }

    return true;
  } catch (error) {
    console.error('❌ Prisma migrate failed');
    return false;
  }
}

// Verify data
function verifyData() {
  console.log('🔍 Verifying database...');
  try {
    const destCount = execSync(
      `mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} -D ${DB_NAME} -se "SELECT COUNT(*) FROM Destination;"`,
      { encoding: 'utf-8' }
    ).trim();
    
    const tourCount = execSync(
      `mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} -D ${DB_NAME} -se "SELECT COUNT(*) FROM Tour;"`,
      { encoding: 'utf-8' }
    ).trim();
    
    const hotelCount = execSync(
      `mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} -D ${DB_NAME} -se "SELECT COUNT(*) FROM Hotel;"`,
      { encoding: 'utf-8' }
    ).trim();
    
    const restaurantCount = execSync(
      `mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} -D ${DB_NAME} -se "SELECT COUNT(*) FROM Restaurant;"`,
      { encoding: 'utf-8' }
    ).trim();

    console.log('\n📊 Database Statistics:');
    console.log(`   - Destinations: ${destCount}`);
    console.log(`   - Tours: ${tourCount}`);
    console.log(`   - Hotels: ${hotelCount}`);
    console.log(`   - Restaurants: ${restaurantCount}\n`);

    if (parseInt(destCount) > 0) {
      console.log('✅ Database setup completed successfully!\n');
      console.log('🔑 Admin Accounts:');
      console.log('   Email: admin@travelgo.dev');
      console.log('   Password: admin123\n');
      console.log('   Email: phong@triennguyen.com');
      console.log('   Password: Phong@2004\n');
      return true;
    } else {
      console.log('⚠️  Database created but may be empty. Run seed manually:');
      console.log('   npm run prisma:seed\n');
      return false;
    }
  } catch (error) {
    console.log('⚠️  Could not verify data (database may not be ready yet)\n');
    return false;
  }
}

// Main
async function main() {
  if (!checkMySQL()) {
    console.error('❌ Cannot connect to MySQL. Please check:');
    console.error('   - MySQL is running');
    console.error('   - Username and password are correct');
    console.error('   - User has CREATE DATABASE permission');
    console.error('\n💡 Tip: Set MYSQL_USER and MYSQL_PASSWORD in .env file');
    process.exit(1);
  }

  if (!createDatabase()) {
    process.exit(1);
  }

  if (!importSQL()) {
    usePrisma();
  }

  verifyData();

  console.log('🎉 Setup complete! You can now start the application:');
  console.log('   npm run dev:all\n');
}

main().catch(console.error);

