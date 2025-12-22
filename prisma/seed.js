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
    // Việt Nam
    'Ninh Bình': 'ninh-binh.jpg',
    'Hạ Long': 'ha-long4.jpg',
    'Đà Lạt': 'da-lat.jpg',
    'Phú Quốc': 'phu-quoc.jpg',
    'Hà Nội': 'ha-noi.jpg',
    'Đà Nẵng': 'da-nang.png',
    'Sa Pa': 'sapa.jpg',
    'Hội An': 'hoi-an.png',
    'Huế': 'hue.jpg',
    'Cần Thơ': 'can-tho.jpg',
    'Vũng Tàu': 'vung-tau.jpg',
    'Nha Trang': 'nha-trang.jpg',
    'Quy Nhơn': 'quynhon.jpg',
    'Hà Giang': 'hagiang-1.jpg',
    'Mù Cang Chải': 'mucangchai.jpg',
    // Đông Nam Á
    'Phuket': 'phuket.jpg',
    'Bangkok': 'bankok.jpg',
    'Bali': 'bali.jpg',
    'Singapore': 'singapore.jpg',
    'Kuala Lumpur': 'kuala-lumpur.jpg',
    // Châu Á
    'Tokyo': 'Tokyo.jpg',
    'Kyoto': 'Kyoto.jpg',
    'Seoul': 'Seoul.jpg',
    'Busan': 'Busan.jpg',
    'Bắc Kinh': 'du_lich_bac_kinh_1.jpeg',
    'Thượng Hải': 'thuong-hai.png',
    'Hồng Kông': 'hong-kong.jpg',
    'Đài Bắc': 'đai-bac.jpg',
    // Châu Âu
    'Paris': 'paris.jpg',
    'London': 'London.jpg',
    'Rome': 'Rome.jpg',
    'Barcelona': 'Barcelona.jpg',
    'Amsterdam': 'Amsterdam.jpg',
    'Prague': 'Prague.jpg',
    'Vienna': 'vienna.jpg',
    'Santorini': 'Santorini.jpg',
    'Istanbul': 'Istanbul.jpg',
    // Châu Mỹ & Úc
    'New York': 'New York.png',
    'Los Angeles': 'Los Angeles.jpg',
    'Grand Canyon': 'Grand Canyon.jpg',
    'Sydney': 'Sydney.jpg',
    'Melbourne': 'Melbourne.jpg',
    // Khác
    'Dubai': 'Dubai.jpg',
    'Cairo': 'Cairo.jpg',
    'Cape Town': 'Cape Town.jpg',
    'Marrakech': 'Marrakech.jpg',
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
  { name: 'Ninh Bình', slug: 'ninh-binh', country: 'Việt Nam', description: 'Di sản Tràng An, Tam Cốc – Bích Động, hang động và non nước hữu tình.', featured: true, price: 5925000, categoryId: 2 },
  { name: 'Hạ Long', slug: 'ha-long', country: 'Việt Nam', description: 'Vịnh Hạ Long – kỳ quan thiên nhiên thế giới với du thuyền và hang động.', featured: true, price: 7850000, categoryId: 2 },
  { name: 'Đà Lạt', slug: 'da-lat', country: 'Việt Nam', description: 'Thành phố sương mù, hoa và những nông trại – khí hậu mát mẻ quanh năm.', featured: true, price: 6240000, categoryId: 2 },
  { name: 'Phú Quốc', slug: 'phu-quoc', country: 'Việt Nam', description: 'Thiên đường nghỉ dưỡng với biển xanh, cát trắng và resort cao cấp.', featured: true, price: 10950000, categoryId: 1 },
  { name: 'Hà Nội', slug: 'ha-noi', country: 'Việt Nam', description: 'Thủ đô nghìn năm văn hiến với phố cổ, ẩm thực phong phú và hồ Hoàn Kiếm thơ mộng.', featured: true, price: 8920000, categoryId: 3 },
  { name: 'Đà Nẵng', slug: 'da-nang', country: 'Việt Nam', description: 'Thành phố đáng sống bên biển với Bà Nà Hills, Ngũ Hành Sơn và những bãi biển tuyệt đẹp.', featured: true, price: 7950000, categoryId: 1 },
  { name: 'Sa Pa', slug: 'sapa', country: 'Việt Nam', description: 'Thị trấn miền núi với ruộng bậc thang, Fansipan và văn hóa dân tộc đặc sắc.', featured: false, price: 6030000, categoryId: 2 },
  { name: 'Hội An', slug: 'hoi-an', country: 'Việt Nam', description: 'Phố cổ Hội An với kiến trúc cổ kính, đèn lồng và ẩm thực đặc sắc.', featured: true, price: 7520000, categoryId: 3 },
  { name: 'Huế', slug: 'hue', country: 'Việt Nam', description: 'Cố đô Huế với đền đài, lăng tẩm và di sản văn hóa UNESCO.', featured: false, price: 6820000, categoryId: 3 },
  { name: 'Cần Thơ', slug: 'can-tho', country: 'Việt Nam', description: 'Thủ phủ miền Tây với chợ nổi Cái Răng, sông nước và văn hóa Nam Bộ.', featured: false, price: 5520000, categoryId: 3 },
  { name: 'Vũng Tàu', slug: 'vung-tau', country: 'Việt Nam', description: 'Thành phố biển gần Sài Gòn với bãi biển, núi Tượng và ẩm thực hải sản.', featured: false, price: 4520000, categoryId: 1 },
  { name: 'Nha Trang', slug: 'nha-trang', country: 'Việt Nam', description: 'Thành phố biển với bãi biển đẹp, Vinpearl và ẩm thực hải sản tươi ngon.', featured: true, price: 8530000, categoryId: 1 },
  { name: 'Quy Nhơn', slug: 'quy-nhon', country: 'Việt Nam', description: 'Thành phố biển yên bình với bãi biển hoang sơ và ẩm thực địa phương.', featured: false, price: 7240000, categoryId: 1 },
  { name: 'Hà Giang', slug: 'ha-giang', country: 'Việt Nam', description: 'Vùng đất cực Bắc với hoa tam giác mạch, cột cờ Lũng Cú và phong cảnh hùng vĩ.', featured: false, price: 5840000, categoryId: 2 },
  { name: 'Mù Cang Chải', slug: 'mu-cang-chai', country: 'Việt Nam', description: 'Ruộng bậc thang vàng óng mùa lúa chín, phong cảnh núi non hùng vĩ.', featured: false, price: 5540000, categoryId: 2 },

  // Quốc tế - Đông Nam Á
  { name: 'Phuket', slug: 'phuket', country: 'Thái Lan', description: 'Hòn đảo nổi tiếng của Thái Lan – biển đẹp, tiệc tùng và hoạt động biển.', featured: true, price: 9875000, categoryId: 1 },
  { name: 'Bangkok', slug: 'bangkok', country: 'Thái Lan', description: 'Thành phố sôi động với chùa Vàng, kênh đào và ẩm thực đường phố hấp dẫn.', featured: true, price: 9940000, categoryId: 3 },
  { name: 'Bali', slug: 'bali', country: 'Indonesia', description: 'Thiên đường nhiệt đới của Indonesia, nổi tiếng với ruộng bậc thang, đền cổ và bãi biển.', featured: true, price: 15920000, categoryId: 1 },
  { name: 'Singapore', slug: 'singapore', country: 'Singapore', description: 'Quốc đảo xanh với Gardens by the Bay, Marina Bay Sands và ẩm thực đa dạng.', featured: true, price: 16950000, categoryId: 3 },
  { name: 'Kuala Lumpur', slug: 'kuala-lumpur', country: 'Malaysia', description: 'Thủ đô Malaysia với tháp đôi Petronas, ẩm thực đa dạng và mua sắm.', featured: false, price: 12930000, categoryId: 3 },

  // Châu Á
  { name: 'Tokyo', slug: 'tokyo', country: 'Nhật Bản', description: 'Thành phố hiện đại bậc nhất, giao thoa giữa truyền thống và công nghệ.', featured: true, price: 22950000, categoryId: 3 },
  { name: 'Kyoto', slug: 'kyoto', country: 'Nhật Bản', description: 'Cố đô Nhật Bản với đền chùa, rừng trúc Arashiyama và văn hóa truyền thống.', featured: true, price: 23920000, categoryId: 3 },
  { name: 'Seoul', slug: 'seoul', country: 'Hàn Quốc', description: 'Thủ đô hiện đại với cung điện cổ, K-pop và ẩm thực Hàn Quốc đặc sắc.', featured: true, price: 14980000, categoryId: 3 },
  { name: 'Busan', slug: 'busan', country: 'Hàn Quốc', description: 'Thành phố cảng với bãi biển Haeundae, chợ cá và văn hóa Hàn Quốc.', featured: false, price: 13950000, categoryId: 1 },
  { name: 'Bắc Kinh', slug: 'beijing', country: 'Trung Quốc', description: 'Thủ đô Trung Quốc với Tử Cấm Thành, Vạn Lý Trường Thành và văn hóa cổ kính.', featured: false, price: 17920000, categoryId: 3 },
  { name: 'Thượng Hải', slug: 'shanghai', country: 'Trung Quốc', description: 'Thành phố hiện đại với skyline ấn tượng, khu phố cổ và mua sắm sang trọng.', featured: false, price: 16980000, categoryId: 3 },
  { name: 'Hồng Kông', slug: 'hong-kong', country: 'Hồng Kông', description: 'Thành phố quốc tế với Victoria Peak, Disneyland và ẩm thực dim sum.', featured: false, price: 18950000, categoryId: 3 },
  { name: 'Đài Bắc', slug: 'taipei', country: 'Đài Loan', description: 'Thủ đô Đài Loan với Taipei 101, đền chùa và ẩm thực đêm phố.', featured: false, price: 11920000, categoryId: 3 },

  // Châu Âu
  { name: 'Paris', slug: 'paris', country: 'Pháp', description: 'Kinh đô ánh sáng với tháp Eiffel, bảo tàng Louvre và những quán cà phê ven đường.', featured: true, price: 19950000, categoryId: 3 },
  { name: 'London', slug: 'london', country: 'Anh', description: 'Thành phố cổ kính với Big Ben, Tower Bridge và những bảo tàng lừng danh thế giới.', featured: true, price: 18920000, categoryId: 3 },
  { name: 'Rome', slug: 'rome', country: 'Ý', description: 'Thành phố vĩnh cửu với Colosseum, Vatican và những di tích lịch sử vĩ đại.', featured: true, price: 17980000, categoryId: 3 },
  { name: 'Barcelona', slug: 'barcelona', country: 'Tây Ban Nha', description: 'Thành phố nghệ thuật với kiến trúc Gaudi, bãi biển Địa Trung Hải và ẩm thực Tây Ban Nha.', featured: false, price: 15950000, categoryId: 3 },
  { name: 'Amsterdam', slug: 'amsterdam', country: 'Hà Lan', description: 'Thành phố kênh đào với bảo tàng Van Gogh, nhà cổ và văn hóa tự do.', featured: false, price: 16920000, categoryId: 3 },
  { name: 'Prague', slug: 'prague', country: 'Séc', description: 'Thành phố cổ tích với lâu đài Prague, cầu Charles và kiến trúc Gothic tuyệt đẹp.', featured: false, price: 12980000, categoryId: 3 },
  { name: 'Vienna', slug: 'vienna', country: 'Áo', description: 'Thủ đô âm nhạc với cung điện Schönbrunn, nhà hát opera và văn hóa cà phê.', featured: false, price: 14950000, categoryId: 3 },
  { name: 'Santorini', slug: 'santorini', country: 'Hy Lạp', description: 'Hòn đảo Hy Lạp với hoàng hôn tuyệt đẹp, nhà trắng và biển xanh.', featured: false, price: 21920000, categoryId: 1 },
  { name: 'Istanbul', slug: 'istanbul', country: 'Thổ Nhĩ Kỳ', description: 'Thành phố giao thoa Á-Âu với Hagia Sophia, Grand Bazaar và văn hóa Ottoman.', featured: false, price: 11950000, categoryId: 3 },

  // Châu Mỹ & Úc
  { name: 'New York', slug: 'new-york', country: 'Mỹ', description: 'Thành phố không bao giờ ngủ với Times Square, Central Park và tượng Nữ thần Tự do.', featured: true, price: 24950000, categoryId: 3 },
  { name: 'Los Angeles', slug: 'los-angeles', country: 'Mỹ', description: 'Thành phố giải trí với Hollywood, Beverly Hills và bãi biển Venice.', featured: false, price: 22920000, categoryId: 3 },
  { name: 'Grand Canyon', slug: 'grand-canyon', country: 'Mỹ', description: 'Hẻm núi kỳ vĩ ở Arizona – trekking, tham quan và ngắm bình minh tuyệt đẹp.', featured: false, price: 27950000, categoryId: 2 },
  { name: 'Sydney', slug: 'sydney', country: 'Úc', description: 'Thành phố cảng xinh đẹp với nhà hát Opera, cầu Harbour và những bãi biển tuyệt vời.', featured: true, price: 17980000, categoryId: 1 },
  { name: 'Melbourne', slug: 'melbourne', country: 'Úc', description: 'Thành phố văn hóa với nghệ thuật đường phố, cà phê và ẩm thực đa dạng.', featured: false, price: 16920000, categoryId: 3 },

  // Khác
  { name: 'Dubai', slug: 'dubai', country: 'UAE', description: 'Thành phố xa hoa với Burj Khalifa, đảo nhân tạo và những trung tâm mua sắm sang trọng.', featured: true, price: 29950000, categoryId: 3 },
  { name: 'Cairo', slug: 'cairo', country: 'Ai Cập', description: 'Thành phố kim tự tháp với Giza, bảo tàng Ai Cập và sông Nile huyền bí.', featured: false, price: 8920000, categoryId: 3 },
  { name: 'Cape Town', slug: 'cape-town', country: 'Nam Phi', description: 'Thành phố mũi với Table Mountain, bãi biển đẹp và văn hóa Nam Phi đa dạng.', featured: false, price: 13950000, categoryId: 2 },
  { name: 'Marrakech', slug: 'marrakech', country: 'Morocco', description: 'Thành phố đỏ với quảng trường Djemaa el-Fna, souk và kiến trúc Hồi giáo.', featured: false, price: 10920000, categoryId: 3 },
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

  // Tours - sample data linked to destinations
  console.log('🧭 Creating tours...');
  const tourData = [
    {
      name: 'Du thuyền Hạ Long 2N1Đ',
      slug: 'du-thuyen-ha-long-2n1d',
      shortDescription: 'Khám phá kỳ quan thiên nhiên thế giới trên du thuyền sang trọng.',
      description: 'Tour du thuyền đưa bạn qua các hang động, làng chài và thưởng thức hải sản tươi ngon.',
      image: '/uploads/avatars/ha-long4.jpg',
      duration: 2,
      price: 3200000,
      originalPrice: 3800000,
      rating: 4.7,
      reviewCount: 126,
      tags: ['Cruise', 'Nature'],
      highlights: [
        { icon: 'ship', text: 'Du thuyền 4 sao, phòng view vịnh' },
        { icon: 'fork-knife', text: 'Hải sản tươi sống' },
        { icon: 'mountain', text: 'Thăm hang Sửng Sốt, chèo kayak' },
      ],
      itinerary: [
        { day: 1, title: 'Check-in & tham quan hang động', activities: ['Check-in', 'Ăn trưa trên tàu', 'Thăm hang', 'Câu mực đêm'] },
        { day: 2, title: 'Kayak & trả phòng', activities: ['Kayak', 'Ăn trưa', 'Trả phòng'] },
      ],
      destinationSlug: 'ha-long',
    },
    {
      name: 'City Tour Hà Nội 1 ngày',
      slug: 'city-tour-ha-noi-1-ngay',
      shortDescription: 'Thăm Văn Miếu, Lăng Bác, phố cổ và ẩm thực đường phố.',
      description: 'Trải nghiệm thủ đô nghìn năm với hướng dẫn viên địa phương.',
      image: '/uploads/avatars/ha-noi.jpg',
      duration: 1,
      price: 890000,
      rating: 4.6,
      reviewCount: 88,
      tags: ['City', 'Culture'],
      highlights: [
        { icon: 'landmark', text: 'Văn Miếu, Lăng Bác' },
        { icon: 'bowl-chopsticks', text: 'Phở, bún chả' },
      ],
      itinerary: [
        { day: 1, title: 'City highlights', activities: ['Văn Miếu', 'Lăng Bác', 'Phố cổ', 'Hồ Hoàn Kiếm'] },
      ],
      destinationSlug: 'ha-noi',
    },
    {
      name: 'Khám phá Phú Quốc 3N2Đ',
      slug: 'kham-pha-phu-quoc-3n2d',
      shortDescription: 'Biển xanh, cát trắng, ngắm hoàng hôn và câu cá đêm.',
      description: 'Combo tham quan Nam đảo, VinWonders và VinSafari.',
      image: '/uploads/avatars/phu-quoc.jpg',
      duration: 3,
      price: 5200000,
      rating: 4.8,
      reviewCount: 64,
      tags: ['Beach', 'Family'],
      highlights: [
        { icon: 'beach', text: 'Sunset Sanato' },
        { icon: 'fish', text: 'Câu cá đêm' },
      ],
      itinerary: [
        { day: 1, title: 'Nam đảo', activities: ['Hòn Thơm', 'Cáp treo', 'Lặn ngắm san hô'] },
        { day: 2, title: 'VinWonders & VinSafari', activities: ['Công viên chủ đề', 'Thế giới động vật'] },
        { day: 3, title: 'Tự do & mua sắm', activities: ['Chợ đêm', 'Đặc sản'] },
      ],
      destinationSlug: 'phu-quoc',
    },
  ];

  for (const t of tourData) {
    try {
      const dest = await prisma.destination.findUnique({ where: { slug: t.destinationSlug } });
      await prisma.tour.upsert({
        where: { slug: t.slug },
        update: {
          name: t.name,
          shortDescription: t.shortDescription,
          description: t.description,
          image: t.image,
          duration: t.duration,
          price: t.price,
          originalPrice: t.originalPrice || null,
          rating: t.rating,
          reviewCount: t.reviewCount || 0,
          tags: t.tags || [],
          highlights: t.highlights || [],
          itinerary: t.itinerary || [],
          destinationId: dest ? dest.id : null,
        },
        create: {
          name: t.name,
          slug: t.slug,
          shortDescription: t.shortDescription,
          description: t.description,
          image: t.image,
          duration: t.duration,
          price: t.price,
          originalPrice: t.originalPrice || null,
          rating: t.rating,
          reviewCount: t.reviewCount || 0,
          tags: t.tags || [],
          highlights: t.highlights || [],
          itinerary: t.itinerary || [],
          destinationId: dest ? dest.id : null,
        },
      });
      console.log(`✅ Created/Updated tour: ${t.name}`);
    } catch (e) {
      console.error('❌ Error creating tour', t.slug, e.message);
    }
  }

  // Hotels - Create hotels for major destinations
  console.log('🏨 Creating hotels...');
  const hotels = [
    // Hạ Long (4)
    { name: 'Halong Bay Luxury Resort', slug: 'halong-bay-luxury-resort', city: 'Hạ Long', destinationId: null, pricePerNight: 2500000, rating: 4.8, amenities: ['wifi', 'pool', 'spa', 'gym'], address: 'Bãi Cháy, Hạ Long', country: 'Việt Nam', description: 'Resort sang trọng với view vịnh Hạ Long tuyệt đẹp' },
    { name: 'Halong Bay View Hotel', slug: 'halong-bay-view-hotel', city: 'Hạ Long', destinationId: null, pricePerNight: 1800000, rating: 4.5, amenities: ['wifi', 'pool', 'restaurant'], address: 'Trung tâm Hạ Long', country: 'Việt Nam', description: 'Khách sạn view vịnh, thuận tiện di chuyển' },
    { name: 'Halong Paradise Hotel', slug: 'halong-paradise-hotel', city: 'Hạ Long', destinationId: null, pricePerNight: 2200000, rating: 4.6, amenities: ['wifi', 'beach', 'spa'], address: 'Bãi Cháy, Hạ Long', country: 'Việt Nam', description: 'Nghỉ dưỡng bên bãi biển, không gian yên tĩnh' },
    { name: 'Halong Cruise Hotel', slug: 'halong-cruise-hotel', city: 'Hạ Long', destinationId: null, pricePerNight: 1900000, rating: 4.4, amenities: ['wifi', 'restaurant'], address: 'Cẩm Phả, Hạ Long', country: 'Việt Nam', description: 'Khách sạn gần cảng du thuyền' },
    
    // Phú Quốc (5)
    { name: 'Phu Quoc Beach Hotel', slug: 'phu-quoc-beach-hotel', city: 'Phú Quốc', destinationId: null, pricePerNight: 3200000, rating: 4.7, amenities: ['wifi', 'pool', 'beach', 'restaurant'], address: 'Bãi Trường, Phú Quốc', country: 'Việt Nam', description: 'Resort biển cao cấp với bãi tắm riêng' },
    { name: 'Phu Quoc Sunset Resort', slug: 'phu-quoc-sunset-resort', city: 'Phú Quốc', destinationId: null, pricePerNight: 3800000, rating: 4.9, amenities: ['wifi', 'pool', 'spa', 'gym', 'beach'], address: 'Bãi Khem, Phú Quốc', country: 'Việt Nam', description: 'Resort 5 sao với view hoàng hôn tuyệt đẹp' },
    { name: 'Phu Quoc Ocean View', slug: 'phu-quoc-ocean-view', city: 'Phú Quốc', destinationId: null, pricePerNight: 2800000, rating: 4.6, amenities: ['wifi', 'pool', 'restaurant'], address: 'Dương Đông, Phú Quốc', country: 'Việt Nam', description: 'Khách sạn view biển, gần trung tâm' },
    { name: 'Phu Quoc Pearl Resort', slug: 'phu-quoc-pearl-resort', city: 'Phú Quốc', destinationId: null, pricePerNight: 3500000, rating: 4.8, amenities: ['wifi', 'pool', 'beach', 'spa', 'gym'], address: 'Bãi Sao, Phú Quốc', country: 'Việt Nam', description: 'Resort cao cấp với spa và nhà hàng' },
    { name: 'Phu Quoc Garden Hotel', slug: 'phu-quoc-garden-hotel', city: 'Phú Quốc', destinationId: null, pricePerNight: 2400000, rating: 4.5, amenities: ['wifi', 'pool', 'garden'], address: 'An Thới, Phú Quốc', country: 'Việt Nam', description: 'Khách sạn với vườn xanh, yên tĩnh' },
    
    // Hà Nội (6)
    { name: 'Hanoi Old Quarter Hotel', slug: 'hanoi-old-quarter-hotel', city: 'Hà Nội', destinationId: null, pricePerNight: 1500000, rating: 4.5, amenities: ['wifi', 'parking', 'restaurant'], address: 'Phố cổ Hà Nội', country: 'Việt Nam', description: 'Khách sạn giữa phố cổ, gần các điểm tham quan' },
    { name: 'Hanoi Skyline Hotel', slug: 'hanoi-skyline-hotel', city: 'Hà Nội', destinationId: null, pricePerNight: 2000000, rating: 4.7, amenities: ['wifi', 'pool', 'gym', 'spa'], address: 'Quận Hoàn Kiếm, Hà Nội', country: 'Việt Nam', description: 'Khách sạn hiện đại, view toàn cảnh thành phố' },
    { name: 'Hanoi Heritage Hotel', slug: 'hanoi-heritage-hotel', city: 'Hà Nội', destinationId: null, pricePerNight: 1800000, rating: 4.4, amenities: ['wifi', 'parking', 'restaurant'], address: 'Quận Ba Đình, Hà Nội', country: 'Việt Nam', description: 'Khách sạn cổ điển, phong cách Pháp' },
    { name: 'Hanoi Capital Hotel', slug: 'hanoi-capital-hotel', city: 'Hà Nội', destinationId: null, pricePerNight: 1600000, rating: 4.3, amenities: ['wifi', 'parking'], address: 'Quận Đống Đa, Hà Nội', country: 'Việt Nam', description: 'Khách sạn gần Văn Miếu, giá hợp lý' },
    { name: 'Hanoi Lake View Hotel', slug: 'hanoi-lake-view-hotel', city: 'Hà Nội', destinationId: null, pricePerNight: 1700000, rating: 4.5, amenities: ['wifi', 'parking', 'restaurant'], address: 'Quận Tây Hồ, Hà Nội', country: 'Việt Nam', description: 'View hồ Tây, không gian yên tĩnh' },
    { name: 'Hanoi Business Hotel', slug: 'hanoi-business-hotel', city: 'Hà Nội', destinationId: null, pricePerNight: 1900000, rating: 4.6, amenities: ['wifi', 'gym', 'restaurant'], address: 'Quận Cầu Giấy, Hà Nội', country: 'Việt Nam', description: 'Khách sạn phục vụ công tác, hội nghị' },
    
    // Đà Nẵng (5)
    { name: 'Da Nang Beach Resort', slug: 'da-nang-beach-resort', city: 'Đà Nẵng', destinationId: null, pricePerNight: 2800000, rating: 4.6, amenities: ['wifi', 'pool', 'beach', 'spa'], address: 'Bãi biển Mỹ Khê, Đà Nẵng', country: 'Việt Nam', description: 'Resort biển với bãi tắm dài, spa đẳng cấp' },
    { name: 'Da Nang City Hotel', slug: 'da-nang-city-hotel', city: 'Đà Nẵng', destinationId: null, pricePerNight: 1800000, rating: 4.5, amenities: ['wifi', 'pool', 'gym'], address: 'Trung tâm Đà Nẵng', country: 'Việt Nam', description: 'Khách sạn hiện đại, gần các địa điểm vui chơi' },
    { name: 'Da Nang Riverside Hotel', slug: 'da-nang-riverside-hotel', city: 'Đà Nẵng', destinationId: null, pricePerNight: 2200000, rating: 4.6, amenities: ['wifi', 'pool', 'restaurant'], address: 'Bờ sông Hàn, Đà Nẵng', country: 'Việt Nam', description: 'View sông Hàn, gần cầu Rồng' },
    { name: 'Da Nang Bay Hotel', slug: 'da-nang-bay-hotel', city: 'Đà Nẵng', destinationId: null, pricePerNight: 2600000, rating: 4.7, amenities: ['wifi', 'pool', 'beach', 'spa'], address: 'Bãi biển Non Nước, Đà Nẵng', country: 'Việt Nam', description: 'Resort view biển, gần Ngũ Hành Sơn' },
    { name: 'Da Nang Airport Hotel', slug: 'da-nang-airport-hotel', city: 'Đà Nẵng', destinationId: null, pricePerNight: 1500000, rating: 4.3, amenities: ['wifi', 'parking'], address: 'Gần sân bay Đà Nẵng', country: 'Việt Nam', description: 'Khách sạn gần sân bay, tiện di chuyển' },
    
    // Đà Lạt (5)
    { name: 'Da Lat Mountain View Hotel', slug: 'da-lat-mountain-view-hotel', city: 'Đà Lạt', destinationId: null, pricePerNight: 1800000, rating: 4.4, amenities: ['wifi', 'parking', 'garden'], address: 'Trung tâm Đà Lạt', country: 'Việt Nam', description: 'Khách sạn view núi, không khí mát mẻ' },
    { name: 'Da Lat Flower Garden Hotel', slug: 'da-lat-flower-garden-hotel', city: 'Đà Lạt', destinationId: null, pricePerNight: 2000000, rating: 4.6, amenities: ['wifi', 'parking', 'garden', 'spa'], address: 'Đường Trần Hưng Đạo, Đà Lạt', country: 'Việt Nam', description: 'Resort với vườn hoa rộng, view hồ Xuân Hương' },
    { name: 'Da Lat Pine Forest Resort', slug: 'da-lat-pine-forest-resort', city: 'Đà Lạt', destinationId: null, pricePerNight: 2500000, rating: 4.7, amenities: ['wifi', 'parking', 'garden', 'spa'], address: 'Đường Trần Quốc Toản, Đà Lạt', country: 'Việt Nam', description: 'Resort trong rừng thông, yên tĩnh' },
    { name: 'Da Lat Lake View Hotel', slug: 'da-lat-lake-view-hotel', city: 'Đà Lạt', destinationId: null, pricePerNight: 1900000, rating: 4.5, amenities: ['wifi', 'parking', 'garden'], address: 'Bờ hồ Xuân Hương, Đà Lạt', country: 'Việt Nam', description: 'View hồ Xuân Hương, gần trung tâm' },
    { name: 'Da Lat Valley Resort', slug: 'da-lat-valley-resort', city: 'Đà Lạt', destinationId: null, pricePerNight: 2300000, rating: 4.6, amenities: ['wifi', 'parking', 'garden', 'spa'], address: 'Thung lũng Tình Yêu, Đà Lạt', country: 'Việt Nam', description: 'Resort view thung lũng, lãng mạn' },
    
    // Hội An (4)
    { name: 'Hoi An Riverside Hotel', slug: 'hoi-an-riverside-hotel', city: 'Hội An', destinationId: null, pricePerNight: 2200000, rating: 4.7, amenities: ['wifi', 'pool', 'spa'], address: 'Bờ sông Hoài, Hội An', country: 'Việt Nam', description: 'Khách sạn bên sông, view phố cổ' },
    { name: 'Hoi An Ancient Town Hotel', slug: 'hoi-an-ancient-town-hotel', city: 'Hội An', destinationId: null, pricePerNight: 1800000, rating: 4.5, amenities: ['wifi', 'parking'], address: 'Phố cổ Hội An', country: 'Việt Nam', description: 'Khách sạn trong phố cổ, kiến trúc cổ kính' },
    { name: 'Hoi An Beach Resort', slug: 'hoi-an-beach-resort', city: 'Hội An', destinationId: null, pricePerNight: 3000000, rating: 4.8, amenities: ['wifi', 'pool', 'beach', 'spa'], address: 'Bãi biển Cửa Đại, Hội An', country: 'Việt Nam', description: 'Resort biển cách phố cổ 5km' },
    { name: 'Hoi An Garden Hotel', slug: 'hoi-an-garden-hotel', city: 'Hội An', destinationId: null, pricePerNight: 2000000, rating: 4.6, amenities: ['wifi', 'parking', 'garden'], address: 'Cẩm Thanh, Hội An', country: 'Việt Nam', description: 'Khách sạn với vườn xanh, yên tĩnh' },
    
    // Nha Trang (4)
    { name: 'Nha Trang Beach Hotel', slug: 'nha-trang-beach-hotel', city: 'Nha Trang', destinationId: null, pricePerNight: 2000000, rating: 4.6, amenities: ['wifi', 'pool', 'beach'], address: 'Bãi biển Nha Trang', country: 'Việt Nam', description: 'Khách sạn view biển, gần Vinpearl' },
    { name: 'Nha Trang Ocean Resort', slug: 'nha-trang-ocean-resort', city: 'Nha Trang', destinationId: null, pricePerNight: 2800000, rating: 4.7, amenities: ['wifi', 'pool', 'beach', 'spa'], address: 'Bãi Dài, Nha Trang', country: 'Việt Nam', description: 'Resort biển cao cấp, bãi tắm riêng' },
    { name: 'Nha Trang City Hotel', slug: 'nha-trang-city-hotel', city: 'Nha Trang', destinationId: null, pricePerNight: 1700000, rating: 4.4, amenities: ['wifi', 'pool'], address: 'Trung tâm Nha Trang', country: 'Việt Nam', description: 'Khách sạn gần chợ, nhà thờ' },
    { name: 'Nha Trang Bay Resort', slug: 'nha-trang-bay-resort', city: 'Nha Trang', destinationId: null, pricePerNight: 3200000, rating: 4.8, amenities: ['wifi', 'pool', 'beach', 'spa', 'gym'], address: 'Vịnh Nha Trang', country: 'Việt Nam', description: 'Resort 5 sao với view vịnh đẹp' },
    
    // Sa Pa (4)
    { name: 'Sapa Mountain Lodge', slug: 'sapa-mountain-lodge', city: 'Sa Pa', destinationId: null, pricePerNight: 1500000, rating: 4.5, amenities: ['wifi', 'parking'], address: 'Trung tâm Sa Pa', country: 'Việt Nam', description: 'Lodge view ruộng bậc thang, Fansipan' },
    { name: 'Sapa Cloud Hotel', slug: 'sapa-cloud-hotel', city: 'Sa Pa', destinationId: null, pricePerNight: 1800000, rating: 4.6, amenities: ['wifi', 'parking', 'spa'], address: 'Đường Cầu Mây, Sa Pa', country: 'Việt Nam', description: 'Khách sạn view núi, không khí trong lành' },
    { name: 'Sapa Valley Resort', slug: 'sapa-valley-resort', city: 'Sa Pa', destinationId: null, pricePerNight: 2200000, rating: 4.7, amenities: ['wifi', 'parking', 'spa'], address: 'Thung lũng Mường Hoa, Sa Pa', country: 'Việt Nam', description: 'Resort view thung lũng, ruộng bậc thang' },
    { name: 'Sapa Homestay Lodge', slug: 'sapa-homestay-lodge', city: 'Sa Pa', destinationId: null, pricePerNight: 1200000, rating: 4.3, amenities: ['wifi'], address: 'Lào Cai, Sa Pa', country: 'Việt Nam', description: 'Homestay trải nghiệm văn hóa dân tộc' },
    
    // Ninh Bình (3)
    { name: 'Ninh Binh Heritage Hotel', slug: 'ninh-binh-heritage-hotel', city: 'Ninh Bình', destinationId: null, pricePerNight: 1600000, rating: 4.5, amenities: ['wifi', 'parking'], address: 'Trung tâm Ninh Bình', country: 'Việt Nam', description: 'Khách sạn gần Tràng An, Tam Cốc' },
    { name: 'Ninh Binh Mountain View', slug: 'ninh-binh-mountain-view', city: 'Ninh Bình', destinationId: null, pricePerNight: 1800000, rating: 4.6, amenities: ['wifi', 'parking', 'garden'], address: 'Tam Cốc, Ninh Bình', country: 'Việt Nam', description: 'View núi non, sông nước' },
    { name: 'Ninh Binh Garden Resort', slug: 'ninh-binh-garden-resort', city: 'Ninh Bình', destinationId: null, pricePerNight: 2000000, rating: 4.7, amenities: ['wifi', 'parking', 'garden', 'spa'], address: 'Tràng An, Ninh Bình', country: 'Việt Nam', description: 'Resort với vườn xanh, gần di sản' },
    
    // Huế (3)
    { name: 'Hue Imperial Hotel', slug: 'hue-imperial-hotel', city: 'Huế', destinationId: null, pricePerNight: 1700000, rating: 4.5, amenities: ['wifi', 'parking'], address: 'Gần Đại Nội, Huế', country: 'Việt Nam', description: 'Khách sạn gần cung đình Huế' },
    { name: 'Hue Riverside Hotel', slug: 'hue-riverside-hotel', city: 'Huế', destinationId: null, pricePerNight: 1900000, rating: 4.6, amenities: ['wifi', 'parking', 'restaurant'], address: 'Bờ sông Hương, Huế', country: 'Việt Nam', description: 'View sông Hương, gần cầu Tràng Tiền' },
    { name: 'Hue Heritage Resort', slug: 'hue-heritage-resort', city: 'Huế', destinationId: null, pricePerNight: 2100000, rating: 4.7, amenities: ['wifi', 'parking', 'garden', 'spa'], address: 'Lăng Khải Định, Huế', country: 'Việt Nam', description: 'Resort gần các lăng tẩm' },
    
    // Cần Thơ (3)
    { name: 'Can Tho Riverside Hotel', slug: 'can-tho-riverside-hotel', city: 'Cần Thơ', destinationId: null, pricePerNight: 1500000, rating: 4.4, amenities: ['wifi', 'parking'], address: 'Bờ sông Cần Thơ', country: 'Việt Nam', description: 'Khách sạn view sông, gần chợ nổi' },
    { name: 'Can Tho Mekong Hotel', slug: 'can-tho-mekong-hotel', city: 'Cần Thơ', destinationId: null, pricePerNight: 1700000, rating: 4.5, amenities: ['wifi', 'parking', 'restaurant'], address: 'Trung tâm Cần Thơ', country: 'Việt Nam', description: 'Khách sạn gần chợ nổi Cái Răng' },
    { name: 'Can Tho Garden Resort', slug: 'can-tho-garden-resort', city: 'Cần Thơ', destinationId: null, pricePerNight: 1900000, rating: 4.6, amenities: ['wifi', 'parking', 'garden'], address: 'Ninh Kiều, Cần Thơ', country: 'Việt Nam', description: 'Resort với vườn cây ăn trái' },
    
    // Vũng Tàu (3)
    { name: 'Vung Tau Beach Hotel', slug: 'vung-tau-beach-hotel', city: 'Vũng Tàu', destinationId: null, pricePerNight: 1800000, rating: 4.5, amenities: ['wifi', 'pool', 'beach'], address: 'Bãi biển Vũng Tàu', country: 'Việt Nam', description: 'Khách sạn view biển, gần tượng Chúa' },
    { name: 'Vung Tau Ocean Resort', slug: 'vung-tau-ocean-resort', city: 'Vũng Tàu', destinationId: null, pricePerNight: 2200000, rating: 4.6, amenities: ['wifi', 'pool', 'beach', 'spa'], address: 'Bãi Sau, Vũng Tàu', country: 'Việt Nam', description: 'Resort biển với bãi tắm đẹp' },
    { name: 'Vung Tau City Hotel', slug: 'vung-tau-city-hotel', city: 'Vũng Tàu', destinationId: null, pricePerNight: 1600000, rating: 4.4, amenities: ['wifi', 'parking'], address: 'Trung tâm Vũng Tàu', country: 'Việt Nam', description: 'Khách sạn gần chợ, nhà hàng' },
    
    // Quy Nhơn (2)
    { name: 'Quy Nhon Beach Resort', slug: 'quy-nhon-beach-resort', city: 'Quy Nhơn', destinationId: null, pricePerNight: 2000000, rating: 4.6, amenities: ['wifi', 'pool', 'beach'], address: 'Bãi biển Quy Nhơn', country: 'Việt Nam', description: 'Resort biển hoang sơ, yên tĩnh' },
    { name: 'Quy Nhon City Hotel', slug: 'quy-nhon-city-hotel', city: 'Quy Nhơn', destinationId: null, pricePerNight: 1700000, rating: 4.5, amenities: ['wifi', 'parking'], address: 'Trung tâm Quy Nhơn', country: 'Việt Nam', description: 'Khách sạn gần các điểm tham quan' },
    
    // Hà Giang (2)
    { name: 'Ha Giang Mountain Lodge', slug: 'ha-giang-mountain-lodge', city: 'Hà Giang', destinationId: null, pricePerNight: 1400000, rating: 4.4, amenities: ['wifi', 'parking'], address: 'Trung tâm Hà Giang', country: 'Việt Nam', description: 'Lodge view núi, gần cột cờ Lũng Cú' },
    { name: 'Ha Giang Valley Hotel', slug: 'ha-giang-valley-hotel', city: 'Hà Giang', destinationId: null, pricePerNight: 1600000, rating: 4.5, amenities: ['wifi', 'parking'], address: 'Đồng Văn, Hà Giang', country: 'Việt Nam', description: 'Khách sạn view thung lũng, hoa tam giác mạch' },
    
    // Mù Cang Chải (2)
    { name: 'Mu Cang Chai Homestay', slug: 'mu-cang-chai-homestay', city: 'Mù Cang Chải', destinationId: null, pricePerNight: 1200000, rating: 4.3, amenities: ['wifi'], address: 'Mù Cang Chải', country: 'Việt Nam', description: 'Homestay view ruộng bậc thang vàng' },
    { name: 'Mu Cang Chai Mountain Lodge', slug: 'mu-cang-chai-mountain-lodge', city: 'Mù Cang Chải', destinationId: null, pricePerNight: 1500000, rating: 4.4, amenities: ['wifi', 'parking'], address: 'Yên Bái, Mù Cang Chải', country: 'Việt Nam', description: 'Lodge view núi, ruộng bậc thang' },
    
    // Quốc tế - Thái Lan (3)
    { name: 'Bangkok City Hotel', slug: 'bangkok-city-hotel', city: 'Bangkok', destinationId: null, pricePerNight: 3500000, rating: 4.5, amenities: ['wifi', 'pool', 'gym', 'restaurant'], address: 'Sukhumvit, Bangkok', country: 'Thái Lan', description: 'Khách sạn hiện đại giữa trung tâm Bangkok' },
    { name: 'Bangkok Riverside Hotel', slug: 'bangkok-riverside-hotel', city: 'Bangkok', destinationId: null, pricePerNight: 3200000, rating: 4.6, amenities: ['wifi', 'pool', 'spa'], address: 'Chao Phraya, Bangkok', country: 'Thái Lan', description: 'View sông Chao Phraya, gần Wat Pho' },
    { name: 'Phuket Beach Resort', slug: 'phuket-beach-resort', city: 'Phuket', destinationId: null, pricePerNight: 3800000, rating: 4.7, amenities: ['wifi', 'pool', 'beach', 'spa'], address: 'Patong Beach, Phuket', country: 'Thái Lan', description: 'Resort biển với bãi tắm đẹp' },
    
    // Singapore (2)
    { name: 'Singapore Marina Hotel', slug: 'singapore-marina-hotel', city: 'Singapore', destinationId: null, pricePerNight: 4500000, rating: 4.8, amenities: ['wifi', 'pool', 'spa', 'gym'], address: 'Marina Bay, Singapore', country: 'Singapore', description: 'Khách sạn 5 sao view Marina Bay Sands' },
    { name: 'Singapore Orchard Hotel', slug: 'singapore-orchard-hotel', city: 'Singapore', destinationId: null, pricePerNight: 4000000, rating: 4.7, amenities: ['wifi', 'pool', 'gym'], address: 'Orchard Road, Singapore', country: 'Singapore', description: 'Khách sạn gần khu mua sắm Orchard' },
    
    // Indonesia (2)
    { name: 'Bali Beach Resort', slug: 'bali-beach-resort', city: 'Bali', destinationId: null, pricePerNight: 4000000, rating: 4.8, amenities: ['wifi', 'pool', 'beach', 'spa'], address: 'Seminyak, Bali', country: 'Indonesia', description: 'Resort biển với view hoàng hôn tuyệt đẹp' },
    { name: 'Bali Ubud Resort', slug: 'bali-ubud-resort', city: 'Bali', destinationId: null, pricePerNight: 3500000, rating: 4.7, amenities: ['wifi', 'pool', 'garden', 'spa'], address: 'Ubud, Bali', country: 'Indonesia', description: 'Resort trong rừng, view ruộng bậc thang' },
    
    // Nhật Bản (2)
    { name: 'Tokyo City Hotel', slug: 'tokyo-city-hotel', city: 'Tokyo', destinationId: null, pricePerNight: 5000000, rating: 4.8, amenities: ['wifi', 'gym', 'restaurant'], address: 'Shibuya, Tokyo', country: 'Nhật Bản', description: 'Khách sạn hiện đại giữa trung tâm Tokyo' },
    { name: 'Kyoto Traditional Hotel', slug: 'kyoto-traditional-hotel', city: 'Kyoto', destinationId: null, pricePerNight: 4800000, rating: 4.7, amenities: ['wifi', 'garden'], address: 'Gion, Kyoto', country: 'Nhật Bản', description: 'Khách sạn truyền thống Nhật Bản' },
    
    // Hàn Quốc (2)
    { name: 'Seoul City Hotel', slug: 'seoul-city-hotel', city: 'Seoul', destinationId: null, pricePerNight: 4200000, rating: 4.7, amenities: ['wifi', 'gym', 'restaurant'], address: 'Myeongdong, Seoul', country: 'Hàn Quốc', description: 'Khách sạn gần khu mua sắm Myeongdong' },
    { name: 'Busan Beach Hotel', slug: 'busan-beach-hotel', city: 'Busan', destinationId: null, pricePerNight: 3800000, rating: 4.6, amenities: ['wifi', 'pool', 'beach'], address: 'Haeundae Beach, Busan', country: 'Hàn Quốc', description: 'Khách sạn view biển Haeundae' },
  ];

  // Get destination IDs for linking
  const destinationMap = {};
  for (const dest of destinations) {
    const dbDest = await prisma.destination.findUnique({ where: { slug: dest.slug } });
    if (dbDest) {
      destinationMap[dest.name] = dbDest.id;
    }
  }

  for (const hotel of hotels) {
    try {
      // Find matching destination by city/name
      let destId = null;
      for (const [destName, destIdValue] of Object.entries(destinationMap)) {
        if (destName.includes(hotel.city) || hotel.city.includes(destName.split(' ')[0])) {
          destId = destIdValue;
          break;
        }
      }
      
      // Specific matches
      if (hotel.city === 'Hạ Long') destId = destinationMap['Hạ Long'];
      if (hotel.city === 'Phú Quốc') destId = destinationMap['Phú Quốc'];
      if (hotel.city === 'Hà Nội') destId = destinationMap['Hà Nội'];
      if (hotel.city === 'Đà Nẵng') destId = destinationMap['Đà Nẵng'];
      if (hotel.city === 'Đà Lạt') destId = destinationMap['Đà Lạt'];
      if (hotel.city === 'Hội An') destId = destinationMap['Hội An'];
      if (hotel.city === 'Nha Trang') destId = destinationMap['Nha Trang'];
      if (hotel.city === 'Sa Pa') destId = destinationMap['Sa Pa'];
      if (hotel.city === 'Ninh Bình') destId = destinationMap['Ninh Bình'];
      if (hotel.city === 'Huế') destId = destinationMap['Huế'];
      if (hotel.city === 'Cần Thơ') destId = destinationMap['Cần Thơ'];
      if (hotel.city === 'Vũng Tàu') destId = destinationMap['Vũng Tàu'];
      if (hotel.city === 'Quy Nhơn') destId = destinationMap['Quy Nhơn'];
      if (hotel.city === 'Hà Giang') destId = destinationMap['Hà Giang'];
      if (hotel.city === 'Mù Cang Chải') destId = destinationMap['Mù Cang Chải'];
      if (hotel.city === 'Bangkok') destId = destinationMap['Bangkok'];
      if (hotel.city === 'Phuket') destId = destinationMap['Phuket'];
      if (hotel.city === 'Singapore') destId = destinationMap['Singapore'];
      if (hotel.city === 'Bali') destId = destinationMap['Bali'];
      if (hotel.city === 'Tokyo') destId = destinationMap['Tokyo'];
      if (hotel.city === 'Kyoto') destId = destinationMap['Kyoto'];
      if (hotel.city === 'Seoul') destId = destinationMap['Seoul'];
      if (hotel.city === 'Busan') destId = destinationMap['Busan'];

      await prisma.hotel.upsert({
        where: { slug: hotel.slug },
        update: {
          name: hotel.name,
          description: hotel.description || null,
          address: hotel.address || null,
          city: hotel.city || null,
          country: hotel.country || 'Việt Nam',
          pricePerNight: hotel.pricePerNight || 0,
          rating: hotel.rating || 0,
          featured: false,
          amenities: hotel.amenities || [],
          destinationId: destId,
        },
        create: {
          name: hotel.name,
          slug: hotel.slug,
          description: hotel.description || null,
          address: hotel.address || null,
          city: hotel.city || null,
          country: hotel.country || 'Việt Nam',
          pricePerNight: hotel.pricePerNight || 0,
          rating: hotel.rating || 0,
          featured: false,
          amenities: hotel.amenities || [],
          destinationId: destId,
        },
      });
      console.log(`✅ Created/Updated hotel: ${hotel.name}`);
    } catch (error) {
      console.error(`❌ Error creating hotel ${hotel.name}:`, error.message);
    }
  }

  // Restaurants - Create restaurants for major destinations
  console.log('🍽️ Creating restaurants...');
  const restaurants = [
    // Hà Nội (6)
    { name: 'Phở Gia Truyền Hà Nội', slug: 'pho-gia-truyen-ha-noi', city: 'Hà Nội', destinationId: null, cuisine: 'Việt Nam', priceRange: '$$', rating: 4.8, amenities: ['wifi', 'parking'], address: '49 Bát Đàn, Hà Nội', country: 'Việt Nam', description: 'Phở bò nổi tiếng, nước dùng đậm đà' },
    { name: 'Bún Chả Hương Liên', slug: 'bun-cha-huong-lien', city: 'Hà Nội', destinationId: null, cuisine: 'Việt Nam', priceRange: '$', rating: 4.7, amenities: ['wifi'], address: '24 Lê Văn Hưu, Hà Nội', country: 'Việt Nam', description: 'Bún chả Obama đã từng ăn' },
    { name: 'Chả Cá Lã Vọng', slug: 'cha-ca-la-vong', city: 'Hà Nội', destinationId: null, cuisine: 'Việt Nam', priceRange: '$$', rating: 4.6, amenities: ['wifi'], address: '14 Chả Cá, Hà Nội', country: 'Việt Nam', description: 'Chả cá truyền thống 100 năm' },
    { name: 'Nhà Hàng Ngon', slug: 'nha-hang-ngon', city: 'Hà Nội', destinationId: null, cuisine: 'Việt Nam', priceRange: '$$', rating: 4.7, amenities: ['wifi', 'parking'], address: '26 Tràng Tiền, Hà Nội', country: 'Việt Nam', description: 'Tổng hợp ẩm thực 3 miền Bắc-Trung-Nam' },
    { name: 'Bánh Cuốn Thanh Trì', slug: 'banh-cuon-thanh-tri', city: 'Hà Nội', destinationId: null, cuisine: 'Việt Nam', priceRange: '$', rating: 4.6, amenities: ['wifi'], address: 'Thanh Trì, Hà Nội', country: 'Việt Nam', description: 'Bánh cuốn Thanh Trì nổi tiếng' },
    { name: 'Nem Nướng Nha Trang Hà Nội', slug: 'nem-nuong-nha-trang-ha-noi', city: 'Hà Nội', destinationId: null, cuisine: 'Việt Nam', priceRange: '$', rating: 4.5, amenities: ['wifi'], address: 'Quận Hai Bà Trưng, Hà Nội', country: 'Việt Nam', description: 'Nem nướng Nha Trang đặc sản' },
    
    // Phú Quốc (5)
    { name: 'Hải Sản Phú Quốc', slug: 'hai-san-phu-quoc', city: 'Phú Quốc', destinationId: null, cuisine: 'Hải sản', priceRange: '$$$', rating: 4.7, amenities: ['wifi', 'outdoor'], address: 'Bãi Dài, Phú Quốc', country: 'Việt Nam', description: 'Hải sản tươi sống, view biển' },
    { name: 'Nhà Hàng Cá Ngừ Đại Dương', slug: 'nha-hang-ca-ngu-dai-duong', city: 'Phú Quốc', destinationId: null, cuisine: 'Hải sản', priceRange: '$$$', rating: 4.8, amenities: ['wifi', 'outdoor'], address: 'Dương Đông, Phú Quốc', country: 'Việt Nam', description: 'Chuyên các món cá ngừ, cá thu' },
    { name: 'Quán Nướng Phú Quốc', slug: 'quan-nuong-phu-quoc', city: 'Phú Quốc', destinationId: null, cuisine: 'BBQ', priceRange: '$$', rating: 4.6, amenities: ['wifi', 'outdoor'], address: 'Bãi Trường, Phú Quốc', country: 'Việt Nam', description: 'Hải sản nướng tại bàn' },
    { name: 'Nhà Hàng Nướng Cá Phú Quốc', slug: 'nha-hang-nuong-ca-phu-quoc', city: 'Phú Quốc', destinationId: null, cuisine: 'Hải sản', priceRange: '$$', rating: 4.7, amenities: ['wifi', 'outdoor'], address: 'An Thới, Phú Quốc', country: 'Việt Nam', description: 'Cá nướng than hoa, tươi ngon' },
    { name: 'Quán Hải Sản Bãi Sao', slug: 'quan-hai-san-bai-sao', city: 'Phú Quốc', destinationId: null, cuisine: 'Hải sản', priceRange: '$$$', rating: 4.8, amenities: ['wifi', 'outdoor'], address: 'Bãi Sao, Phú Quốc', country: 'Việt Nam', description: 'Hải sản tươi, view biển đẹp' },
    
    // Hội An (5)
    { name: 'Cơm Gà Hội An', slug: 'com-ga-hoi-an', city: 'Hội An', destinationId: null, cuisine: 'Việt Nam', priceRange: '$$', rating: 4.6, amenities: ['wifi'], address: 'Phố cổ Hội An', country: 'Việt Nam', description: 'Cơm gà đặc sản Hội An' },
    { name: 'Cao Lầu Bà Bé', slug: 'cao-lau-ba-be', city: 'Hội An', destinationId: null, cuisine: 'Việt Nam', priceRange: '$', rating: 4.8, amenities: ['wifi'], address: 'Phố cổ Hội An', country: 'Việt Nam', description: 'Cao lầu nổi tiếng, nước dùng đậm đà' },
    { name: 'Bánh Mì Phượng', slug: 'banh-mi-phuong', city: 'Hội An', destinationId: null, cuisine: 'Việt Nam', priceRange: '$', rating: 4.7, amenities: ['wifi'], address: 'Phố cổ Hội An', country: 'Việt Nam', description: 'Bánh mì được Anthony Bourdain khen' },
    { name: 'Bánh Đập Hội An', slug: 'banh-dap-hoi-an', city: 'Hội An', destinationId: null, cuisine: 'Việt Nam', priceRange: '$', rating: 4.5, amenities: ['wifi'], address: 'Phố cổ Hội An', country: 'Việt Nam', description: 'Bánh đập đặc sản Hội An' },
    { name: 'Nhà Hàng Hội An', slug: 'nha-hang-hoi-an', city: 'Hội An', destinationId: null, cuisine: 'Việt Nam', priceRange: '$$', rating: 4.6, amenities: ['wifi', 'parking'], address: 'Cẩm Thanh, Hội An', country: 'Việt Nam', description: 'Tổng hợp ẩm thực Hội An' },
    
    // Đà Nẵng (5)
    { name: 'Seafood Restaurant Đà Nẵng', slug: 'seafood-restaurant-da-nang', city: 'Đà Nẵng', destinationId: null, cuisine: 'Hải sản', priceRange: '$$$', rating: 4.8, amenities: ['wifi', 'outdoor'], address: 'Bãi biển Mỹ Khê, Đà Nẵng', country: 'Việt Nam', description: 'Hải sản tươi, view biển' },
    { name: 'Quán Bê Thui Cầu Mống', slug: 'quan-be-thui-cau-mong', city: 'Đà Nẵng', destinationId: null, cuisine: 'Việt Nam', priceRange: '$$', rating: 4.7, amenities: ['wifi'], address: 'Quận Sơn Trà, Đà Nẵng', country: 'Việt Nam', description: 'Bê thui nổi tiếng Đà Nẵng' },
    { name: 'Mì Quảng Ba Mua', slug: 'mi-quang-ba-mua', city: 'Đà Nẵng', destinationId: null, cuisine: 'Việt Nam', priceRange: '$', rating: 4.6, amenities: ['wifi'], address: 'Quận Hải Châu, Đà Nẵng', country: 'Việt Nam', description: 'Mì Quảng đặc sản miền Trung' },
    { name: 'Bánh Xèo Đà Nẵng', slug: 'banh-xeo-da-nang', city: 'Đà Nẵng', destinationId: null, cuisine: 'Việt Nam', priceRange: '$', rating: 4.5, amenities: ['wifi'], address: 'Quận Thanh Khê, Đà Nẵng', country: 'Việt Nam', description: 'Bánh xèo giòn, nhân tôm thịt' },
    { name: 'Nhà Hàng Hải Sản Sơn Trà', slug: 'nha-hang-hai-san-son-tra', city: 'Đà Nẵng', destinationId: null, cuisine: 'Hải sản', priceRange: '$$$', rating: 4.7, amenities: ['wifi', 'outdoor'], address: 'Bán đảo Sơn Trà, Đà Nẵng', country: 'Việt Nam', description: 'Hải sản tươi, view biển đẹp' },
    
    // Đà Lạt (5)
    { name: 'Nhà hàng Đà Lạt', slug: 'nha-hang-da-lat', city: 'Đà Lạt', destinationId: null, cuisine: 'Việt Nam', priceRange: '$$', rating: 4.4, amenities: ['wifi', 'parking'], address: 'Trung tâm Đà Lạt', country: 'Việt Nam', description: 'Ẩm thực Đà Lạt, rau củ tươi' },
    { name: 'Lẩu Gà Lá É Đà Lạt', slug: 'lau-ga-la-e-da-lat', city: 'Đà Lạt', destinationId: null, cuisine: 'Việt Nam', priceRange: '$$', rating: 4.6, amenities: ['wifi'], address: 'Đường Trần Hưng Đạo, Đà Lạt', country: 'Việt Nam', description: 'Lẩu gà lá é đặc trưng Đà Lạt' },
    { name: 'Bánh Căn Đà Lạt', slug: 'banh-can-da-lat', city: 'Đà Lạt', destinationId: null, cuisine: 'Việt Nam', priceRange: '$', rating: 4.5, amenities: ['wifi'], address: 'Chợ Đà Lạt', country: 'Việt Nam', description: 'Bánh căn nóng, ăn kèm trứng' },
    { name: 'Nem Nướng Đà Lạt', slug: 'nem-nuong-da-lat', city: 'Đà Lạt', destinationId: null, cuisine: 'Việt Nam', priceRange: '$', rating: 4.6, amenities: ['wifi'], address: 'Đường Nguyễn Chí Thanh, Đà Lạt', country: 'Việt Nam', description: 'Nem nướng đặc sản Đà Lạt' },
    { name: 'Nhà Hàng Rau Củ Đà Lạt', slug: 'nha-hang-rau-cu-da-lat', city: 'Đà Lạt', destinationId: null, cuisine: 'Chay', priceRange: '$$', rating: 4.5, amenities: ['wifi', 'parking'], address: 'Trung tâm Đà Lạt', country: 'Việt Nam', description: 'Món chay từ rau củ tươi Đà Lạt' },
    
    // Huế (4)
    { name: 'Bún Bò Huế', slug: 'bun-bo-hue', city: 'Huế', destinationId: null, cuisine: 'Việt Nam', priceRange: '$', rating: 4.5, amenities: ['wifi'], address: 'Trung tâm Huế', country: 'Việt Nam', description: 'Bún bò Huế chính gốc' },
    { name: 'Cơm Hến Bà Hoa', slug: 'com-hen-ba-hoa', city: 'Huế', destinationId: null, cuisine: 'Việt Nam', priceRange: '$', rating: 4.6, amenities: ['wifi'], address: 'Đường Lê Lợi, Huế', country: 'Việt Nam', description: 'Cơm hến đặc sản xứ Huế' },
    { name: 'Nhà Hàng Hoàng Gia', slug: 'nha-hang-hoang-gia', city: 'Huế', destinationId: null, cuisine: 'Cung đình', priceRange: '$$$', rating: 4.7, amenities: ['wifi', 'parking'], address: 'Đường Lê Lợi, Huế', country: 'Việt Nam', description: 'Ẩm thực cung đình Huế' },
    { name: 'Bánh Bèo Huế', slug: 'banh-beo-hue', city: 'Huế', destinationId: null, cuisine: 'Việt Nam', priceRange: '$', rating: 4.6, amenities: ['wifi'], address: 'Phố cổ Huế', country: 'Việt Nam', description: 'Bánh bèo, bánh nậm đặc sản Huế' },
    
    // Nha Trang (4)
    { name: 'Hải Sản Nha Trang', slug: 'hai-san-nha-trang', city: 'Nha Trang', destinationId: null, cuisine: 'Hải sản', priceRange: '$$$', rating: 4.7, amenities: ['wifi', 'outdoor'], address: 'Bãi biển Nha Trang', country: 'Việt Nam', description: 'Hải sản tươi, view biển' },
    { name: 'Bún Sứa Nha Trang', slug: 'bun-sua-nha-trang', city: 'Nha Trang', destinationId: null, cuisine: 'Việt Nam', priceRange: '$', rating: 4.6, amenities: ['wifi'], address: 'Trung tâm Nha Trang', country: 'Việt Nam', description: 'Bún sứa đặc sản Nha Trang' },
    { name: 'Nem Nướng Nha Trang', slug: 'nem-nuong-nha-trang', city: 'Nha Trang', destinationId: null, cuisine: 'Việt Nam', priceRange: '$', rating: 4.7, amenities: ['wifi'], address: 'Chợ Đầm, Nha Trang', country: 'Việt Nam', description: 'Nem nướng Nha Trang nổi tiếng' },
    { name: 'Nhà Hàng Hải Sản Vịnh', slug: 'nha-hang-hai-san-vinh', city: 'Nha Trang', destinationId: null, cuisine: 'Hải sản', priceRange: '$$$', rating: 4.8, amenities: ['wifi', 'outdoor'], address: 'Vịnh Nha Trang', country: 'Việt Nam', description: 'Hải sản tươi, view vịnh đẹp' },
    
    // Sa Pa (3)
    { name: 'Nhà Hàng Thổ Cẩm', slug: 'nha-hang-tho-cam', city: 'Sa Pa', destinationId: null, cuisine: 'Dân tộc', priceRange: '$$', rating: 4.5, amenities: ['wifi'], address: 'Trung tâm Sa Pa', country: 'Việt Nam', description: 'Ẩm thực dân tộc vùng cao' },
    { name: 'Lẩu Cá Hồi Sa Pa', slug: 'lau-ca-hoi-sapa', city: 'Sa Pa', destinationId: null, cuisine: 'Việt Nam', priceRange: '$$', rating: 4.6, amenities: ['wifi'], address: 'Đường Cầu Mây, Sa Pa', country: 'Việt Nam', description: 'Lẩu cá hồi tươi, thịt bò' },
    { name: 'Thắng Cố Sa Pa', slug: 'thang-co-sapa', city: 'Sa Pa', destinationId: null, cuisine: 'Dân tộc', priceRange: '$$', rating: 4.4, amenities: ['wifi'], address: 'Bản Cát Cát, Sa Pa', country: 'Việt Nam', description: 'Thắng cố đặc sản vùng cao' },
    
    // Ninh Bình (3)
    { name: 'Dê Núi Ninh Bình', slug: 'de-nui-ninh-binh', city: 'Ninh Bình', destinationId: null, cuisine: 'Việt Nam', priceRange: '$$', rating: 4.6, amenities: ['wifi'], address: 'Tam Cốc, Ninh Bình', country: 'Việt Nam', description: 'Dê núi nướng, nấu lẩu' },
    { name: 'Cơm Cháy Ninh Bình', slug: 'com-chay-ninh-binh', city: 'Ninh Bình', destinationId: null, cuisine: 'Việt Nam', priceRange: '$', rating: 4.5, amenities: ['wifi'], address: 'Tràng An, Ninh Bình', country: 'Việt Nam', description: 'Cơm cháy đặc sản Ninh Bình' },
    { name: 'Nhà Hàng Sông Nước', slug: 'nha-hang-song-nuoc', city: 'Ninh Bình', destinationId: null, cuisine: 'Việt Nam', priceRange: '$$', rating: 4.7, amenities: ['wifi', 'outdoor'], address: 'Tam Cốc, Ninh Bình', country: 'Việt Nam', description: 'Nhà hàng view sông, núi non' },
    
    // Cần Thơ (3)
    { name: 'Nhà Hàng Chợ Nổi', slug: 'nha-hang-cho-noi', city: 'Cần Thơ', destinationId: null, cuisine: 'Việt Nam', priceRange: '$$', rating: 4.5, amenities: ['wifi'], address: 'Chợ nổi Cái Răng, Cần Thơ', country: 'Việt Nam', description: 'Ẩm thực miền Tây trên chợ nổi' },
    { name: 'Lẩu Mắm Cần Thơ', slug: 'lau-mam-can-tho', city: 'Cần Thơ', destinationId: null, cuisine: 'Việt Nam', priceRange: '$$', rating: 4.6, amenities: ['wifi'], address: 'Trung tâm Cần Thơ', country: 'Việt Nam', description: 'Lẩu mắm đặc sản miền Tây' },
    { name: 'Bánh Tét Cần Thơ', slug: 'banh-tet-can-tho', city: 'Cần Thơ', destinationId: null, cuisine: 'Việt Nam', priceRange: '$', rating: 4.5, amenities: ['wifi'], address: 'Ninh Kiều, Cần Thơ', country: 'Việt Nam', description: 'Bánh tét, bánh ít đặc sản' },
    
    // Vũng Tàu (3)
    { name: 'Hải Sản Vũng Tàu', slug: 'hai-san-vung-tau', city: 'Vũng Tàu', destinationId: null, cuisine: 'Hải sản', priceRange: '$$$', rating: 4.6, amenities: ['wifi', 'outdoor'], address: 'Bãi biển Vũng Tàu', country: 'Việt Nam', description: 'Hải sản tươi, view biển' },
    { name: 'Bánh Khọt Vũng Tàu', slug: 'banh-khot-vung-tau', city: 'Vũng Tàu', destinationId: null, cuisine: 'Việt Nam', priceRange: '$', rating: 4.5, amenities: ['wifi'], address: 'Trung tâm Vũng Tàu', country: 'Việt Nam', description: 'Bánh khọt đặc sản Vũng Tàu' },
    { name: 'Nhà Hàng Biển Vũng Tàu', slug: 'nha-hang-bien-vung-tau', city: 'Vũng Tàu', destinationId: null, cuisine: 'Hải sản', priceRange: '$$$', rating: 4.7, amenities: ['wifi', 'outdoor'], address: 'Bãi Sau, Vũng Tàu', country: 'Việt Nam', description: 'Hải sản tươi, không gian đẹp' },
    
    // Quy Nhơn (2)
    { name: 'Hải Sản Quy Nhơn', slug: 'hai-san-quy-nhon', city: 'Quy Nhơn', destinationId: null, cuisine: 'Hải sản', priceRange: '$$$', rating: 4.6, amenities: ['wifi', 'outdoor'], address: 'Bãi biển Quy Nhơn', country: 'Việt Nam', description: 'Hải sản tươi, view biển hoang sơ' },
    { name: 'Bánh Xèo Quy Nhơn', slug: 'banh-xeo-quy-nhon', city: 'Quy Nhơn', destinationId: null, cuisine: 'Việt Nam', priceRange: '$', rating: 4.5, amenities: ['wifi'], address: 'Trung tâm Quy Nhơn', country: 'Việt Nam', description: 'Bánh xèo đặc sản Quy Nhơn' },
    
    // Hà Giang (2)
    { name: 'Nhà Hàng Vùng Cao', slug: 'nha-hang-vung-cao', city: 'Hà Giang', destinationId: null, cuisine: 'Dân tộc', priceRange: '$$', rating: 4.4, amenities: ['wifi'], address: 'Đồng Văn, Hà Giang', country: 'Việt Nam', description: 'Ẩm thực dân tộc vùng cao' },
    { name: 'Thắng Cố Hà Giang', slug: 'thang-co-ha-giang', city: 'Hà Giang', destinationId: null, cuisine: 'Dân tộc', priceRange: '$$', rating: 4.5, amenities: ['wifi'], address: 'Mèo Vạc, Hà Giang', country: 'Việt Nam', description: 'Thắng cố đặc sản vùng cao' },
    
    // Mù Cang Chải (2)
    { name: 'Nhà Hàng Ruộng Bậc Thang', slug: 'nha-hang-ruong-bac-thang', city: 'Mù Cang Chải', destinationId: null, cuisine: 'Dân tộc', priceRange: '$$', rating: 4.4, amenities: ['wifi'], address: 'Mù Cang Chải', country: 'Việt Nam', description: 'Ẩm thực dân tộc, view ruộng bậc thang' },
    { name: 'Cơm Lam Mù Cang Chải', slug: 'com-lam-mu-cang-chai', city: 'Mù Cang Chải', destinationId: null, cuisine: 'Dân tộc', priceRange: '$', rating: 4.3, amenities: ['wifi'], address: 'Yên Bái, Mù Cang Chải', country: 'Việt Nam', description: 'Cơm lam đặc sản vùng cao' },
    
    // Quốc tế - Thái Lan (4)
    { name: 'Thai Street Food Bangkok', slug: 'thai-street-food-bangkok', city: 'Bangkok', destinationId: null, cuisine: 'Thái Lan', priceRange: '$', rating: 4.7, amenities: ['wifi'], address: 'Khao San Road, Bangkok', country: 'Thái Lan', description: 'Pad Thai, Tom Yum, Mango Sticky Rice' },
    { name: 'Tom Yum Goong Bangkok', slug: 'tom-yum-goong-bangkok', city: 'Bangkok', destinationId: null, cuisine: 'Thái Lan', priceRange: '$$', rating: 4.8, amenities: ['wifi'], address: 'Sukhumvit, Bangkok', country: 'Thái Lan', description: 'Tom Yum Goong chính gốc' },
    { name: 'Phuket Seafood Restaurant', slug: 'phuket-seafood-restaurant', city: 'Phuket', destinationId: null, cuisine: 'Hải sản', priceRange: '$$$', rating: 4.7, amenities: ['wifi', 'outdoor'], address: 'Patong Beach, Phuket', country: 'Thái Lan', description: 'Hải sản tươi, view biển' },
    { name: 'Green Curry Phuket', slug: 'green-curry-phuket', city: 'Phuket', destinationId: null, cuisine: 'Thái Lan', priceRange: '$$', rating: 4.6, amenities: ['wifi'], address: 'Kata Beach, Phuket', country: 'Thái Lan', description: 'Green Curry, Massaman Curry' },
    
    // Singapore (3)
    { name: 'Singapore Hawker Center', slug: 'singapore-hawker-center', city: 'Singapore', destinationId: null, cuisine: 'Singapore', priceRange: '$', rating: 4.6, amenities: ['wifi'], address: 'Chinatown, Singapore', country: 'Singapore', description: 'Chicken Rice, Laksa, Chili Crab' },
    { name: 'Singapore Chili Crab', slug: 'singapore-chili-crab', city: 'Singapore', destinationId: null, cuisine: 'Singapore', priceRange: '$$$', rating: 4.8, amenities: ['wifi'], address: 'Marina Bay, Singapore', country: 'Singapore', description: 'Chili Crab nổi tiếng Singapore' },
    { name: 'Singapore Laksa', slug: 'singapore-laksa', city: 'Singapore', destinationId: null, cuisine: 'Singapore', priceRange: '$', rating: 4.7, amenities: ['wifi'], address: 'Little India, Singapore', country: 'Singapore', description: 'Laksa Singapore chính gốc' },
    
    // Indonesia (2)
    { name: 'Bali Warung Ubud', slug: 'bali-warung-ubud', city: 'Bali', destinationId: null, cuisine: 'Indonesia', priceRange: '$$', rating: 4.7, amenities: ['wifi', 'outdoor'], address: 'Ubud, Bali', country: 'Indonesia', description: 'Nasi Goreng, Satay, Babi Guling' },
    { name: 'Bali Beach Restaurant', slug: 'bali-beach-restaurant', city: 'Bali', destinationId: null, cuisine: 'Hải sản', priceRange: '$$$', rating: 4.8, amenities: ['wifi', 'outdoor'], address: 'Seminyak, Bali', country: 'Indonesia', description: 'Hải sản tươi, view hoàng hôn' },
    
    // Nhật Bản (3)
    { name: 'Tokyo Sushi Bar', slug: 'tokyo-sushi-bar', city: 'Tokyo', destinationId: null, cuisine: 'Nhật Bản', priceRange: '$$$', rating: 4.8, amenities: ['wifi'], address: 'Shibuya, Tokyo', country: 'Nhật Bản', description: 'Sushi, Sashimi tươi ngon' },
    { name: 'Tokyo Ramen Shop', slug: 'tokyo-ramen-shop', city: 'Tokyo', destinationId: null, cuisine: 'Nhật Bản', priceRange: '$', rating: 4.7, amenities: ['wifi'], address: 'Shinjuku, Tokyo', country: 'Nhật Bản', description: 'Ramen chính gốc Tokyo' },
    { name: 'Kyoto Kaiseki Restaurant', slug: 'kyoto-kaiseki-restaurant', city: 'Kyoto', destinationId: null, cuisine: 'Nhật Bản', priceRange: '$$$$', rating: 4.9, amenities: ['wifi'], address: 'Gion, Kyoto', country: 'Nhật Bản', description: 'Kaiseki truyền thống Nhật Bản' },
    
    // Hàn Quốc (3)
    { name: 'Seoul BBQ Restaurant', slug: 'seoul-bbq-restaurant', city: 'Seoul', destinationId: null, cuisine: 'Hàn Quốc', priceRange: '$$', rating: 4.7, amenities: ['wifi'], address: 'Myeongdong, Seoul', country: 'Hàn Quốc', description: 'Korean BBQ, Bulgogi, Galbi' },
    { name: 'Seoul Kimchi House', slug: 'seoul-kimchi-house', city: 'Seoul', destinationId: null, cuisine: 'Hàn Quốc', priceRange: '$', rating: 4.6, amenities: ['wifi'], address: 'Insadong, Seoul', country: 'Hàn Quốc', description: 'Kimchi, Bibimbap, Tteokbokki' },
    { name: 'Busan Seafood Market', slug: 'busan-seafood-market', city: 'Busan', destinationId: null, cuisine: 'Hải sản', priceRange: '$$$', rating: 4.8, amenities: ['wifi'], address: 'Jagalchi Market, Busan', country: 'Hàn Quốc', description: 'Hải sản tươi sống, sashimi' },
  ];

  for (const restaurant of restaurants) {
    try {
      // Find matching destination by city/name
      let destId = null;
      for (const [destName, destIdValue] of Object.entries(destinationMap)) {
        if (destName.includes(restaurant.city) || restaurant.city.includes(destName.split(' ')[0])) {
          destId = destIdValue;
          break;
        }
      }
      
      // Specific matches
      if (restaurant.city === 'Hà Nội') destId = destinationMap['Hà Nội'];
      if (restaurant.city === 'Phú Quốc') destId = destinationMap['Phú Quốc'];
      if (restaurant.city === 'Hội An') destId = destinationMap['Hội An'];
      if (restaurant.city === 'Huế') destId = destinationMap['Huế'];
      if (restaurant.city === 'Đà Lạt') destId = destinationMap['Đà Lạt'];
      if (restaurant.city === 'Đà Nẵng') destId = destinationMap['Đà Nẵng'];
      if (restaurant.city === 'Nha Trang') destId = destinationMap['Nha Trang'];
      if (restaurant.city === 'Sa Pa') destId = destinationMap['Sa Pa'];
      if (restaurant.city === 'Ninh Bình') destId = destinationMap['Ninh Bình'];
      if (restaurant.city === 'Cần Thơ') destId = destinationMap['Cần Thơ'];
      if (restaurant.city === 'Vũng Tàu') destId = destinationMap['Vũng Tàu'];
      if (restaurant.city === 'Quy Nhơn') destId = destinationMap['Quy Nhơn'];
      if (restaurant.city === 'Hà Giang') destId = destinationMap['Hà Giang'];
      if (restaurant.city === 'Mù Cang Chải') destId = destinationMap['Mù Cang Chải'];
      if (restaurant.city === 'Bangkok') destId = destinationMap['Bangkok'];
      if (restaurant.city === 'Phuket') destId = destinationMap['Phuket'];
      if (restaurant.city === 'Singapore') destId = destinationMap['Singapore'];
      if (restaurant.city === 'Bali') destId = destinationMap['Bali'];
      if (restaurant.city === 'Tokyo') destId = destinationMap['Tokyo'];
      if (restaurant.city === 'Kyoto') destId = destinationMap['Kyoto'];
      if (restaurant.city === 'Seoul') destId = destinationMap['Seoul'];
      if (restaurant.city === 'Busan') destId = destinationMap['Busan'];

      await prisma.restaurant.upsert({
        where: { slug: restaurant.slug },
        update: {
          name: restaurant.name,
          description: restaurant.description || null,
          address: restaurant.address || null,
          city: restaurant.city || null,
          country: restaurant.country || 'Việt Nam',
          cuisine: restaurant.cuisine || null,
          priceRange: restaurant.priceRange || null,
          rating: restaurant.rating || 0,
          featured: false,
          amenities: restaurant.amenities || [],
          destinationId: destId,
        },
        create: {
          name: restaurant.name,
          slug: restaurant.slug,
          description: restaurant.description || null,
          address: restaurant.address || null,
          city: restaurant.city || null,
          country: restaurant.country || 'Việt Nam',
          cuisine: restaurant.cuisine || null,
          priceRange: restaurant.priceRange || null,
          rating: restaurant.rating || 0,
          featured: false,
          amenities: restaurant.amenities || [],
          destinationId: destId,
        },
      });
      console.log(`✅ Created/Updated restaurant: ${restaurant.name}`);
    } catch (error) {
      console.error(`❌ Error creating restaurant ${restaurant.name}:`, error.message);
    }
  }

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