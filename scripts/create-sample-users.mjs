#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

console.log('👥 Creating Sample Users');
console.log('========================');

const sampleUsers = [
  {
    email: 'admin@travelgo.com',
    name: 'Admin TravelGo',
    role: 'admin',
    passwordHash: await bcrypt.hash('admin123', 10)
  },
  {
    email: 'phong@triennguyen.com',
    name: 'Phong',
    role: 'admin',
    passwordHash: await bcrypt.hash('Phong@2004', 10)
  },
  {
    email: 'manager@travelgo.com', 
    name: 'Manager TravelGo',
    role: 'manager',
    passwordHash: await bcrypt.hash('manager123', 10)
  },
  {
    email: 'customer1@gmail.com',
    name: 'Nguyễn Văn Minh',
    role: 'user',
    passwordHash: await bcrypt.hash('customer123', 10)
  },
  {
    email: 'customer2@gmail.com',
    name: 'Trần Thị Lan',
    role: 'user', 
    passwordHash: await bcrypt.hash('customer123', 10)
  },
  {
    email: 'customer3@gmail.com',
    name: 'Lê Văn Khoa',
    role: 'user',
    passwordHash: await bcrypt.hash('customer123', 10)
  }
];

async function createSampleUsers() {
  try {
    console.log('📝 Creating sample users...');
    
    let created = 0;
    for (const user of sampleUsers) {
      // Check if user already exists
      const existing = await prisma.user.findUnique({
        where: { email: user.email }
      });
      
      if (!existing) {
        await prisma.user.create({
          data: user
        });
        created++;
        console.log(`   ✅ Created user: ${user.email} (${user.role})`);
      } else {
        console.log(`   ⚠️ User already exists: ${user.email}`);
      }
    }
    
    console.log(`\n✅ ${created} new users created!`);
    
  } catch (error) {
    console.error('❌ Error creating users:', error.message);
  }
}

async function createSampleBookings() {
  try {
    console.log('📝 Creating sample bookings...');
    
    // Get users and destinations
    const users = await prisma.user.findMany({ where: { role: 'user' } });
    const destinations = await prisma.destination.findMany();
    
    if (users.length === 0 || destinations.length === 0) {
      console.log('   ⚠️ No users or destinations found');
      return;
    }
    
    const sampleBookings = [
      {
        userId: users[0].id,
        destinationId: destinations[0].id,
        destinationName: destinations[0].name,
        guests: 2,
        checkIn: new Date('2024-12-25'),
        checkOut: new Date('2024-12-28'),
        totalAmount: destinations[0].price * 2,
        status: 'paid'
      },
      {
        userId: users[1]?.id || users[0].id,
        destinationId: destinations[1]?.id || destinations[0].id,
        destinationName: destinations[1]?.name || destinations[0].name,
        guests: 4,
        checkIn: new Date('2024-12-30'),
        checkOut: new Date('2025-01-02'),
        totalAmount: (destinations[1]?.price || destinations[0].price) * 4,
        status: 'confirmed'
      }
    ];
    
    let created = 0;
    for (const booking of sampleBookings) {
      await prisma.booking.create({
        data: booking
      });
      created++;
      console.log(`   ✅ Created booking: ${booking.destinationName} for ${booking.guests} guests`);
    }
    
    console.log(`\n✅ ${created} sample bookings created!`);
    
  } catch (error) {
    console.error('❌ Error creating bookings:', error.message);
  }
}

async function showFinalSummary() {
  try {
    console.log('\n📊 Final Database Summary:');
    console.log('==========================');
    
    const userCount = await prisma.user.count();
    const destCount = await prisma.destination.count();
    const reviewCount = await prisma.review.count();
    const bookingCount = await prisma.booking.count();
    const transactionCount = await prisma.transaction.count();
    const couponCount = await prisma.coupon.count();
    
    console.log(`👥 Users: ${userCount}`);
    console.log(`🏖️ Destinations: ${destCount}`);
    console.log(`⭐ Reviews: ${reviewCount}`);
    console.log(`📅 Bookings: ${bookingCount}`);
    console.log(`💳 Transactions: ${transactionCount}`);
    console.log(`🎫 Coupons: ${couponCount}`);
    
    // Show user roles
    const userRoles = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    });
    
    console.log('\n👤 Users by Role:');
    userRoles.forEach(item => {
      console.log(`   ${item.role}: ${item._count.role} users`);
    });
    
  } catch (error) {
    console.error('❌ Error getting summary:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Creating sample users and bookings...\n');
    
    // Create sample users
    await createSampleUsers();
    console.log('');
    
    // Create sample bookings
    await createSampleBookings();
    console.log('');
    
    // Show final summary
    await showFinalSummary();
    
    console.log('\n🎉 Sample data creation completed!');
    console.log('🔑 Login credentials:');
    console.log('   Admin: admin@travelgo.com / admin123');
    console.log('   Manager: manager@travelgo.com / manager123');
    console.log('   Customer: customer1@gmail.com / customer123');
    
  } catch (error) {
    console.error('❌ Creating sample data failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main().catch(console.error);
