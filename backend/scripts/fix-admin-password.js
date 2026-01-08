const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function fixAdminPassword() {
  try {
    console.log('🔐 Fixing admin password...\n');
    
    const email = 'phong@triennguyen.com';
    const newPassword = 'Phong@2004'; // Default password
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true, role: true }
    });
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return;
    }
    
    console.log(`📋 User found: ${user.name} (${user.email}) - Role: ${user.role}`);
    
    // Hash new password
    console.log('🔑 Hashing new password...');
    const passwordHash = await bcrypt.hash(newPassword, 10);
    console.log('✅ Password hashed:', passwordHash.substring(0, 30) + '...');
    
    // Update password using raw query to avoid schema mismatch
    await prisma.$executeRaw`
      UPDATE \`User\` 
      SET \`passwordHash\` = ${passwordHash}
      WHERE \`id\` = ${user.id}
    `;
    
    console.log('\n✅ Password updated successfully!');
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Password: ${newPassword}`);
    console.log('\n⚠️  Please change this password after logging in!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminPassword();

