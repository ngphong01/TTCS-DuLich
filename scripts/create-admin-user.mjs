#!/usr/bin/env node
/**
 * Script để tạo tài khoản admin
 * Usage: node scripts/create-admin-user.mjs
 */

import bcrypt from 'bcryptjs';
import { join } from 'path';
import { existsSync } from 'fs';

// Import better-sqlite3
import Database from 'better-sqlite3';

const dbPath = join(process.cwd(), 'database', 'travelgo.db');

if (!existsSync(dbPath)) {
  console.error('❌ Database file not found:', dbPath);
  console.log('💡 Please run database setup first');
  process.exit(1);
}

const db = new Database(dbPath);

async function createAdminUser() {
  try {
    const email = 'phong@triennguyen.com';
    const password = 'Phong@2004';
    const name = 'Phong Admin';
    
    // Hash password with proper salt rounds
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Verify hash immediately
    const testMatch = await bcrypt.compare(password, passwordHash);
    console.log('✅ Password hash verification:', testMatch ? 'PASSED' : 'FAILED');
    
    // Check if user already exists
    const existing = db.prepare('SELECT id FROM user WHERE email = ?').get(email);
    
    if (existing) {
      // Update existing user
      db.prepare(`
        UPDATE user 
        SET name = ?, 
            role = 'admin', 
            passwordHash = ?,
            emailVerified = 1
        WHERE email = ?
      `).run(name, passwordHash, email);
      
      console.log('✅ Đã cập nhật tài khoản admin:', email);
    } else {
      // Create new user
      const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      db.prepare(`
        INSERT INTO user (id, email, name, role, passwordHash, emailVerified)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId, email, name, 'admin', passwordHash, 1);
      
      console.log('✅ Đã tạo tài khoản admin:', email);
    }
    
    console.log('');
    console.log('🔑 Thông tin đăng nhập:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: admin`);
    
  } catch (error) {
    console.error('❌ Lỗi khi tạo admin user:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

createAdminUser();

