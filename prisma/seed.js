/* prisma/seed.js */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

// Helper function to get image path for destination
function getDestinationImage(destinationName) {
  const avatarsDir = path.join(__dirname, '..', 'uploads', 'avatars');
  
  if (!fs.existsSync(avatarsDir)) {
    return null;
  }
  
  // Map destination names to image filenames
  const imageMap = {
    'Amsterdam': 'Amsterdam.jpg',
    'Barcelona': 'Barcelona.jpg',
    'Cairo': 'Cairo.jpg',
    'Cape Town': 'Cape Town.jpg',
    'Dubai': 'Dubai.jpg',
    'Grand Canyon': 'Grand Canyon.jpg',
    'Istanbul': 'Istanbul.jpg',
    'London': 'London.jpg',
    'Los Angeles': 'Los Angeles.jpg',
    'Marrakech': 'Marrakech.jpg',
    'Melbourne': 'Melbourne.jpg',
    'New York': 'New York.png',
    'Prague': 'Prague.jpg',
    'Rome': 'Rome.jpg',
    'Santorini': 'Santorini.jpg',
    'Sydney': 'Sydney.jpg',
    'Vienna': 'vienna.jpg',
  };
  
  // Check if exact match exists
  const imageFile = imageMap[destinationName];
  if (imageFile) {
    const imagePath = path.join(avatarsDir, imageFile);
    if (fs.existsSync(imagePath)) {
      return `/uploads/avatars/${imageFile}`;
    }
  }
  
  // Try to find by normalized name (remove diacritics)
  const normalized = destinationName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
  
  // Try different variations
  const variations = [
    `${normalized}.jpg`,
    `${normalized}.png`,
    `${normalized.replace(/\s+/g, ' ')}.jpg`,
    `${normalized.replace(/\s+/g, ' ')}.png`,
    `${destinationName}.jpg`,
    `${destinationName}.png`,
  ];
  
  for (const variant of variations) {
    const variantPath = path.join(avatarsDir, variant);
    if (fs.existsSync(variantPath)) {
      return `/uploads/avatars/${variant}`;
    }
  }
  
  return null;
}

// Destinations data with country field
const destinations = [
  // Việt Nam
  { name: 'Ninh Bình', slug: 'ninh-binh', country: 'Việt Nam', description: 'Di sản Tràng An, Tam Cốc – Bích Động, hang động và non nước hữu tình.', featured: true, price: 5900000, categoryId: 2 },
  { name: 'Hạ Long', slug: 'ha-long', country: 'Việt Nam', description: 'Vịnh Hạ Long – kỳ quan thiên nhiên thế giới với du thuyền và hang động.', featured: true, price: 7900000, categoryId: 2 },
  { name: 'Đà Lạt', slug: 'da-lat', country: 'Việt Nam', description: 'Thành phố sương mù, hoa và những nông trại – khí hậu mát mẻ quanh năm.', featured: true, price: 6200000, categoryId: 2 },
  { name: 'Phú Quốc', slug: 'phu-quoc', country: 'Việt Nam', description: 'Thiên đường nghỉ dưỡng với biển xanh, cát trắng và resort cao cấp.', featured: true, price: 10900000, categoryId: 1 },
  { name: 'Hà Nội', slug: 'ha-noi', country: 'Việt Nam', description: 'Thủ đô nghìn năm văn hiến với phố cổ, ẩm thực phong phú và hồ Hoàn Kiếm thơ mộng.', featured: true, price: 8900000, categoryId: 3 },
  { name: 'Đà Nẵng', slug: 'da-nang', country: 'Việt Nam', description: 'Thành phố đáng sống bên biển với Bà Nà Hills, Ngũ Hành Sơn và những bãi biển tuyệt đẹp.', featured: true, price: 7900000, categoryId: 1 },
  { name: 'Sa Pa', slug: 'sapa', country: 'Việt Nam', description: 'Thị trấn miền núi với ruộng bậc thang, Fansipan và văn hóa dân tộc đặc sắc.', featured: false, price: 6000000, categoryId: 2 },
  { name: 'Hội An', slug: 'hoi-an', country: 'Việt Nam', description: 'Phố cổ Hội An với kiến trúc cổ kính, đèn lồng và ẩm thực đặc sắc.', featured: true, price: 7500000, categoryId: 3 },
  { name: 'Huế', slug: 'hue', country: 'Việt Nam', description: 'Cố đô Huế với đền đài, lăng tẩm và di sản văn hóa UNESCO.', featured: false, price: 6800000, categoryId: 3 },
  { name: 'Cần Thơ', slug: 'can-tho', country: 'Việt Nam', description: 'Thủ phủ miền Tây với chợ nổi Cái Răng, sông nước và văn hóa Nam Bộ.', featured: false, price: 5500000, categoryId: 3 },
  { name: 'Vũng Tàu', slug: 'vung-tau', country: 'Việt Nam', description: 'Thành phố biển gần Sài Gòn với bãi biển, núi Tượng và ẩm thực hải sản.', featured: false, price: 4500000, categoryId: 1 },
  { name: 'Nha Trang', slug: 'nha-trang', country: 'Việt Nam', description: 'Thành phố biển với bãi biển đẹp, Vinpearl và ẩm thực hải sản tươi ngon.', featured: true, price: 8500000, categoryId: 1 },
  { name: 'Quy Nhơn', slug: 'quy-nhon', country: 'Việt Nam', description: 'Thành phố biển yên bình với bãi biển hoang sơ và ẩm thực địa phương.', featured: false, price: 7200000, categoryId: 1 },
  { name: 'Hà Giang', slug: 'ha-giang', country: 'Việt Nam', description: 'Vùng đất cực Bắc với hoa tam giác mạch, cột cờ Lũng Cú và phong cảnh hùng vĩ.', featured: false, price: 5800000, categoryId: 2 },
  { name: 'Mù Cang Chải', slug: 'mu-cang-chai', country: 'Việt Nam', description: 'Ruộng bậc thang vàng óng mùa lúa chín, phong cảnh núi non hùng vĩ.', featured: false, price: 5500000, categoryId: 2 },

  // Quốc tế - Đông Nam Á
  { name: 'Phuket', slug: 'phuket', country: 'Thái Lan', description: 'Hòn đảo nổi tiếng của Thái Lan – biển đẹp, tiệc tùng và hoạt động biển.', featured: true, price: 9900000, categoryId: 1 },
  { name: 'Bangkok', slug: 'bangkok', country: 'Thái Lan', description: 'Thành phố sôi động với chùa Vàng, kênh đào và ẩm thực đường phố hấp dẫn.', featured: true, price: 9900000, categoryId: 3 },
  { name: 'Bali', slug: 'bali', country: 'Indonesia', description: 'Thiên đường nhiệt đới của Indonesia, nổi tiếng với ruộng bậc thang, đền cổ và bãi biển.', featured: true, price: 15900000, categoryId: 1 },
  { name: 'Singapore', slug: 'singapore', country: 'Singapore', description: 'Quốc đảo xanh với Gardens by the Bay, Marina Bay Sands và ẩm thực đa dạng.', featured: true, price: 16900000, categoryId: 3 },
  { name: 'Kuala Lumpur', slug: 'kuala-lumpur', country: 'Malaysia', description: 'Thủ đô Malaysia với tháp đôi Petronas, ẩm thực đa dạng và mua sắm.', featured: false, price: 12900000, categoryId: 3 },

  // Châu Á
  { name: 'Tokyo', slug: 'tokyo', country: 'Nhật Bản', description: 'Thành phố hiện đại bậc nhất, giao thoa giữa truyền thống và công nghệ.', featured: true, price: 22900000, categoryId: 3 },
  { name: 'Kyoto', slug: 'kyoto', country: 'Nhật Bản', description: 'Cố đô Nhật Bản với đền chùa, rừng trúc Arashiyama và văn hóa truyền thống.', featured: true, price: 23900000, categoryId: 3 },
  { name: 'Seoul', slug: 'seoul', country: 'Hàn Quốc', description: 'Thủ đô hiện đại với cung điện cổ, K-pop và ẩm thực Hàn Quốc đặc sắc.', featured: true, price: 14900000, categoryId: 3 },
  { name: 'Busan', slug: 'busan', country: 'Hàn Quốc', description: 'Thành phố cảng với bãi biển Haeundae, chợ cá và văn hóa Hàn Quốc.', featured: false, price: 13900000, categoryId: 1 },
  { name: 'Bắc Kinh', slug: 'beijing', country: 'Trung Quốc', description: 'Thủ đô Trung Quốc với Tử Cấm Thành, Vạn Lý Trường Thành và văn hóa cổ kính.', featured: false, price: 17900000, categoryId: 3 },
  { name: 'Thượng Hải', slug: 'shanghai', country: 'Trung Quốc', description: 'Thành phố hiện đại với skyline ấn tượng, khu phố cổ và mua sắm sang trọng.', featured: false, price: 16900000, categoryId: 3 },
  { name: 'Hồng Kông', slug: 'hong-kong', country: 'Hồng Kông', description: 'Thành phố quốc tế với Victoria Peak, Disneyland và ẩm thực dim sum.', featured: false, price: 18900000, categoryId: 3 },
  { name: 'Đài Bắc', slug: 'taipei', country: 'Đài Loan', description: 'Thủ đô Đài Loan với Taipei 101, đền chùa và ẩm thực đêm phố.', featured: false, price: 11900000, categoryId: 3 },

  // Châu Âu
  { name: 'Paris', slug: 'paris', country: 'Pháp', description: 'Kinh đô ánh sáng với tháp Eiffel, bảo tàng Louvre và những quán cà phê ven đường.', featured: true, price: 19900000, categoryId: 3 },
  { name: 'London', slug: 'london', country: 'Anh', description: 'Thành phố cổ kính với Big Ben, Tower Bridge và những bảo tàng lừng danh thế giới.', featured: true, price: 18900000, categoryId: 3 },
  { name: 'Rome', slug: 'rome', country: 'Ý', description: 'Thành phố vĩnh cửu với Colosseum, Vatican và những di tích lịch sử vĩ đại.', featured: true, price: 17900000, categoryId: 3 },
  { name: 'Barcelona', slug: 'barcelona', country: 'Tây Ban Nha', description: 'Thành phố nghệ thuật với kiến trúc Gaudi, bãi biển Địa Trung Hải và ẩm thực Tây Ban Nha.', featured: false, price: 15900000, categoryId: 3 },
  { name: 'Amsterdam', slug: 'amsterdam', country: 'Hà Lan', description: 'Thành phố kênh đào với bảo tàng Van Gogh, nhà cổ và văn hóa tự do.', featured: false, price: 16900000, categoryId: 3 },
  { name: 'Prague', slug: 'prague', country: 'Séc', description: 'Thành phố cổ tích với lâu đài Prague, cầu Charles và kiến trúc Gothic tuyệt đẹp.', featured: false, price: 12900000, categoryId: 3 },
  { name: 'Vienna', slug: 'vienna', country: 'Áo', description: 'Thủ đô âm nhạc với cung điện Schönbrunn, nhà hát opera và văn hóa cà phê.', featured: false, price: 14900000, categoryId: 3 },
  { name: 'Santorini', slug: 'santorini', country: 'Hy Lạp', description: 'Hòn đảo Hy Lạp với hoàng hôn tuyệt đẹp, nhà trắng và biển xanh.', featured: false, price: 21900000, categoryId: 1 },
  { name: 'Istanbul', slug: 'istanbul', country: 'Thổ Nhĩ Kỳ', description: 'Thành phố giao thoa Á-Âu với Hagia Sophia, Grand Bazaar và văn hóa Ottoman.', featured: false, price: 11900000, categoryId: 3 },

  // Châu Mỹ & Úc
  { name: 'New York', slug: 'new-york', country: 'Mỹ', description: 'Thành phố không bao giờ ngủ với Times Square, Central Park và tượng Nữ thần Tự do.', featured: true, price: 24900000, categoryId: 3 },
  { name: 'Los Angeles', slug: 'los-angeles', country: 'Mỹ', description: 'Thành phố giải trí với Hollywood, Beverly Hills và bãi biển Venice.', featured: false, price: 22900000, categoryId: 3 },
  { name: 'Grand Canyon', slug: 'grand-canyon', country: 'Mỹ', description: 'Hẻm núi kỳ vĩ ở Arizona – trekking, tham quan và ngắm bình minh tuyệt đẹp.', featured: false, price: 27900000, categoryId: 2 },
  { name: 'Sydney', slug: 'sydney', country: 'Úc', description: 'Thành phố cảng xinh đẹp với nhà hát Opera, cầu Harbour và những bãi biển tuyệt vời.', featured: true, price: 17900000, categoryId: 1 },
  { name: 'Melbourne', slug: 'melbourne', country: 'Úc', description: 'Thành phố văn hóa với nghệ thuật đường phố, cà phê và ẩm thực đa dạng.', featured: false, price: 16900000, categoryId: 3 },

  // Khác
  { name: 'Dubai', slug: 'dubai', country: 'UAE', description: 'Thành phố xa hoa với Burj Khalifa, đảo nhân tạo và những trung tâm mua sắm sang trọng.', featured: true, price: 29900000, categoryId: 3 },
  { name: 'Cairo', slug: 'cairo', country: 'Ai Cập', description: 'Thành phố kim tự tháp với Giza, bảo tàng Ai Cập và sông Nile huyền bí.', featured: false, price: 8900000, categoryId: 3 },
  { name: 'Cape Town', slug: 'cape-town', country: 'Nam Phi', description: 'Thành phố mũi với Table Mountain, bãi biển đẹp và văn hóa Nam Phi đa dạng.', featured: false, price: 13900000, categoryId: 2 },
  { name: 'Marrakech', slug: 'marrakech', country: 'Morocco', description: 'Thành phố đỏ với quảng trường Djemaa el-Fna, souk và kiến trúc Hồi giáo.', featured: false, price: 10900000, categoryId: 3 },
];

async function run() {
  console.log('🌱 Starting seed...');

  // Categories
  const beach = await prisma.category.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Beach' },
  });
  const adventure = await prisma.category.upsert({
    where: { id: 2 },
    update: {},
    create: { name: 'Adventure' },
  });
  const city = await prisma.category.upsert({
    where: { id: 3 },
    update: {},
    create: { name: 'City' },
  });
  const nature = await prisma.category.upsert({
    where: { id: 4 },
    update: {},
    create: { name: 'Nature' },
  });
  const culture = await prisma.category.upsert({
    where: { id: 5 },
    update: {},
    create: { name: 'Culture' },
  });

  console.log('✅ Categories created');

  // Destinations
  console.log(`📦 Creating ${destinations.length} destinations...`);
  
  for (const dest of destinations) {
    try {
      // Get image path for destination
      const imagePath = getDestinationImage(dest.name);
      
      await prisma.destination.upsert({
        where: { slug: dest.slug },
        update: {
          name: dest.name,
          description: dest.description,
          featured: dest.featured,
          price: dest.price,
          categoryId: dest.categoryId,
          country: dest.country || 'Việt Nam',
          image: imagePath,
        },
        create: {
          ...dest,
          country: dest.country || 'Việt Nam',
          image: imagePath,
        },
      });
      console.log(`✅ Created/Updated: ${dest.name}${imagePath ? ` (image: ${imagePath})` : ' (no image found)'}`);
    } catch (error) {
      console.error(`❌ Error creating ${dest.name}:`, error.message);
    }
  }

  console.log(`✅ ${destinations.length} destinations processed`);

  // Admin users
  const bcrypt = require('bcryptjs');
  
  // Admin 1 (password: admin123)
  const hash1 = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@travelgo.dev' },
    update: {},
    create: {
      email: 'admin@travelgo.dev',
      passwordHash: hash1,
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  // Admin 2 (password: Phong@2004)
  const hash2 = await bcrypt.hash('Phong@2004', 10);
  await prisma.user.upsert({
    where: { email: 'phong@triennguyen.com' },
    update: {},
    create: {
      email: 'phong@triennguyen.com',
      passwordHash: hash2,
      name: 'Phong Admin',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin users created');
  console.log('🎉 Seed completed successfully!');
}

run()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });