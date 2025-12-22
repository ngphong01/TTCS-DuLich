const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function resetPassword() {
  try {
    console.log('🔐 Reset Admin Password\n');
    
    const email = await question('Email: ');
    if (!email) {
      console.log('❌ Email is required');
      rl.close();
      return;
    }
    
    const newPassword = await question('New password: ');
    if (!newPassword || newPassword.length < 6) {
      console.log('❌ Password must be at least 6 characters');
      rl.close();
      return;
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, email: true, name: true, role: true }
    });
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      rl.close();
      return;
    }
    
    console.log(`\n📋 User found: ${user.name} (${user.email}) - Role: ${user.role}`);
    
    const confirm = await question('\n⚠️  Are you sure you want to reset password? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Cancelled');
      rl.close();
      return;
    }
    
    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });
    
    console.log('\n✅ Password reset successfully!');
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 New password: ${newPassword}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

resetPassword();

