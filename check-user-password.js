// Check user password in database
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected\n');

    const email = 'phong@triennguyen.com';
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true, role: true }
    });

    if (!user) {
      console.log(`❌ User ${email} not found in database`);
      console.log('\n💡 Creating user...');
      
      const hash = await bcrypt.hash('Phong@2004', 10);
      const newUser = await prisma.user.create({
        data: {
          email,
          passwordHash: hash,
          name: 'Phong Admin',
          role: 'ADMIN'
        }
      });
      console.log('✅ User created:', { id: newUser.id, email: newUser.email, role: newUser.role });
    } else {
      console.log('✅ User found:', { id: user.id, email: user.email, name: user.name, role: user.role });
      
      // Test password
      const testPassword = 'Phong@2004';
      const isMatch = await bcrypt.compare(testPassword, user.passwordHash);
      
      if (isMatch) {
        console.log(`✅ Password "${testPassword}" is CORRECT`);
      } else {
        console.log(`❌ Password "${testPassword}" is INCORRECT`);
        console.log('\n💡 Updating password...');
        
        const newHash = await bcrypt.hash('Phong@2004', 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: newHash }
        });
        console.log('✅ Password updated successfully');
        console.log('\n📝 You can now login with:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: Phong@2004`);
      }
    }

    // Also check admin@travelgo.dev
    const adminEmail = 'admin@travelgo.dev';
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (admin) {
      const adminTest = await bcrypt.compare('admin123', admin.passwordHash);
      console.log(`\n✅ Admin user (${adminEmail}): ${adminTest ? 'Password OK' : 'Password needs update'}`);
      if (!adminTest) {
        const newAdminHash = await bcrypt.hash('admin123', 10);
        await prisma.user.update({
          where: { id: admin.id },
          data: { passwordHash: newAdminHash }
        });
        console.log('✅ Admin password updated');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();

