// scripts/check-setup.js
// Script kiểm tra setup để phát hiện lỗi sớm

const fs = require('fs');
const path = require('path');

console.log('🔍 Kiểm tra setup TravelGo...\n');

let errors = [];
let warnings = [];

// 1. Kiểm tra .env file
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  warnings.push('⚠️  File .env không tồn tại. Hãy copy từ ENV_SAMPLE.txt và cấu hình.');
} else {
  console.log('✅ File .env tồn tại');
}

// 2. Kiểm tra node_modules
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  errors.push('❌ node_modules không tồn tại. Chạy: npm install');
} else {
  console.log('✅ node_modules tồn tại');
}

const frontendNodeModulesPath = path.join(__dirname, '..', 'frontend', 'node_modules');
if (!fs.existsSync(frontendNodeModulesPath)) {
  errors.push('❌ frontend/node_modules không tồn tại. Chạy: npm run install:all');
} else {
  console.log('✅ frontend/node_modules tồn tại');
}

// 3. Kiểm tra logo
const logoPath = path.join(__dirname, '..', 'uploads', 'Logo', 'logo.png');
if (!fs.existsSync(logoPath)) {
  warnings.push('⚠️  Logo không tồn tại: uploads/Logo/logo.png');
} else {
  console.log('✅ Logo tồn tại');
}

// 4. Kiểm tra ảnh destinations
const avatarsPath = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(avatarsPath)) {
  warnings.push('⚠️  Folder uploads/avatars không tồn tại');
} else {
  const avatarFiles = fs.readdirSync(avatarsPath).filter(f => 
    f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg')
  );
  if (avatarFiles.length === 0) {
    warnings.push('⚠️  Không có ảnh destinations trong uploads/avatars/');
  } else {
    console.log(`✅ Tìm thấy ${avatarFiles.length} ảnh destinations`);
  }
}

// 5. Kiểm tra database SQL file
const sqlPath = path.join(__dirname, '..', 'database', 'travelgo_complete.sql');
if (!fs.existsSync(sqlPath)) {
  warnings.push('⚠️  File database/travelgo_complete.sql không tồn tại');
} else {
  const stats = fs.statSync(sqlPath);
  if (stats.size === 0) {
    warnings.push('⚠️  File database/travelgo_complete.sql rỗng');
  } else {
    console.log(`✅ File SQL tồn tại (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  }
}

// 6. Kiểm tra Prisma schema
const prismaSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
if (!fs.existsSync(prismaSchemaPath)) {
  errors.push('❌ File prisma/schema.prisma không tồn tại');
} else {
  console.log('✅ Prisma schema tồn tại');
}

// 7. Kiểm tra Prisma client
const prismaClientPath = path.join(__dirname, '..', 'node_modules', '.prisma', 'client');
if (!fs.existsSync(prismaClientPath)) {
  warnings.push('⚠️  Prisma client chưa được generate. Chạy: npm run prisma:generate');
} else {
  console.log('✅ Prisma client đã được generate');
}

// 8. Kiểm tra seed file
const seedPath = path.join(__dirname, '..', 'prisma', 'seed.js');
if (!fs.existsSync(seedPath)) {
  warnings.push('⚠️  File prisma/seed.js không tồn tại');
} else {
  console.log('✅ Seed file tồn tại');
}

// 9. Kiểm tra .gitkeep files
const gitkeepPaths = [
  'uploads/.gitkeep',
  'uploads/avatars/.gitkeep',
  'uploads/destinations/.gitkeep',
  'uploads/tours/.gitkeep',
  'uploads/hotels/.gitkeep',
  'uploads/restaurants/.gitkeep',
  'uploads/reviews/.gitkeep',
  'uploads/banners/.gitkeep',
  'uploads/blogs/.gitkeep',
];

let gitkeepCount = 0;
gitkeepPaths.forEach(relPath => {
  const fullPath = path.join(__dirname, '..', relPath);
  if (fs.existsSync(fullPath)) {
    gitkeepCount++;
  }
});

if (gitkeepCount === gitkeepPaths.length) {
  console.log('✅ Tất cả .gitkeep files tồn tại');
} else {
  warnings.push(`⚠️  Thiếu ${gitkeepPaths.length - gitkeepCount} .gitkeep files`);
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 TÓM TẮT KIỂM TRA\n');

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ Tất cả kiểm tra đều PASS!');
  console.log('\n🚀 Bạn có thể chạy: npm run dev:all');
  process.exit(0);
}

if (errors.length > 0) {
  console.log('❌ LỖI (Cần sửa ngay):');
  errors.forEach(err => console.log(`  ${err}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  CẢNH BÁO (Nên kiểm tra):');
  warnings.forEach(warn => console.log(`  ${warn}`));
  console.log('');
}

if (errors.length > 0) {
  console.log('💡 Hướng dẫn sửa lỗi:');
  console.log('  1. Cài đặt dependencies: npm run install:all');
  console.log('  2. Generate Prisma client: npm run prisma:generate');
  console.log('  3. Setup database: npm run setup:db');
  console.log('  4. Xem chi tiết: SETUP.md\n');
  process.exit(1);
}

process.exit(0);

