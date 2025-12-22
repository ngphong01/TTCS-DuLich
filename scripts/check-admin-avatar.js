require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'phong@triennguyen.com' },
      select: { id: true, email: true, name: true, avatarUrl: true }
    });
    
    console.log('Admin user:', JSON.stringify(admin, null, 2));
    
    if (!admin.avatarUrl) {
      console.log('\n⚠️  Admin has no avatar!');
      console.log('💡 Generating avatar...');
      
      const { createUserAvatar } = require('../lib/avatarGenerator');
      const avatarUrl = createUserAvatar(admin.name, admin.email, admin.id);
      
      // Use raw query to avoid schema mismatch issues
      await prisma.$executeRaw`
        UPDATE \`User\` 
        SET \`avatarUrl\` = ${avatarUrl}
        WHERE \`id\` = ${admin.id}
      `;
      
      console.log('✅ Avatar generated:', avatarUrl);
    } else {
      console.log('✅ Admin has avatar:', admin.avatarUrl);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();

