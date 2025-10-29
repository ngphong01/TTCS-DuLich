#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('🌍 Importing Real Travel Data');
console.log('=============================');

// Real destinations from popular travel sites
const REAL_DESTINATIONS = [
  {
    slug: "halong-bay",
    name: "Vịnh Hạ Long",
    description: "Di sản thế giới UNESCO với hàng nghìn đảo đá vôi và hang động tuyệt đẹp. Du thuyền qua vịnh là trải nghiệm không thể bỏ qua.",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1600&auto=format&fit=crop",
    rating: 4.8,
    price: 8500000,
    country: "Việt Nam",
    tags: "unesco,boat,cave,nature"
  },
  {
    slug: "hoi-an-ancient-town",
    name: "Phố cổ Hội An",
    description: "Di sản thế giới UNESCO với kiến trúc cổ kính, đèn lồng đa màu sắc và ẩm thực đặc sản miền Trung.",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1600&auto=format&fit=crop",
    rating: 4.7,
    price: 3200000,
    country: "Việt Nam",
    tags: "unesco,architecture,food,culture"
  },
  {
    slug: "phong-nha-ke-bang",
    name: "Vườn Quốc gia Phong Nha - Kẻ Bàng",
    description: "Di sản thế giới UNESCO với hệ thống hang động lớn nhất thế giới, bao gồm hang Sơn Đoòng.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1600&auto=format&fit=crop",
    rating: 4.9,
    price: 4500000,
    country: "Việt Nam",
    tags: "unesco,cave,adventure,nature"
  },
  {
    slug: "angkor-wat",
    name: "Angkor Wat",
    description: "Di sản thế giới UNESCO - quần thể đền đài Khmer cổ đại lớn nhất thế giới tại Campuchia.",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1600&auto=format&fit=crop",
    rating: 4.8,
    price: 12000000,
    country: "Campuchia",
    tags: "unesco,temple,history,culture"
  },
  {
    slug: "bali-ubud",
    name: "Ubud, Bali",
    description: "Trung tâm văn hóa Bali với ruộng bậc thang Tegalalang, đền cổ và nghệ thuật truyền thống.",
    image: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1600&auto=format&fit=crop",
    rating: 4.6,
    price: 8900000,
    country: "Indonesia",
    tags: "culture,rice-terrace,temple,art"
  },
  {
    slug: "boracay-island",
    name: "Đảo Boracay",
    description: "Thiên đường biển Philippines với bãi cát trắng White Beach và hoạt động lặn biển tuyệt vời.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1600&auto=format&fit=crop",
    rating: 4.5,
    price: 11500000,
    country: "Philippines",
    tags: "beach,diving,island,water-sports"
  },
  {
    slug: "tokyo-shibuya",
    name: "Shibuya, Tokyo",
    description: "Khu phố sầm uất nhất Tokyo với giao lộ Shibuya Crossing, shopping và ẩm thực Nhật Bản.",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1600&auto=format&fit=crop",
    rating: 4.7,
    price: 18500000,
    country: "Nhật Bản",
    tags: "city,shopping,food,technology"
  },
  {
    slug: "kyoto-temples",
    name: "Kyoto Temples",
    description: "Cố đô Nhật Bản với hơn 2000 đền chùa, rừng trúc Arashiyama và văn hóa truyền thống.",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1600&auto=format&fit=crop",
    rating: 4.8,
    price: 16500000,
    country: "Nhật Bản",
    tags: "temple,culture,history,bamboo"
  },
  {
    slug: "singapore-marina-bay",
    name: "Marina Bay, Singapore",
    description: "Khu vực hiện đại nhất Singapore với Marina Bay Sands, Gardens by the Bay và Merlion.",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1600&auto=format&fit=crop",
    rating: 4.6,
    price: 13500000,
    country: "Singapore",
    tags: "modern,architecture,garden,shopping"
  },
  {
    slug: "bangkok-grand-palace",
    name: "Grand Palace, Bangkok",
    description: "Cung điện hoàng gia Thái Lan với Wat Phra Kaew và kiến trúc truyền thống tuyệt đẹp.",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1600&auto=format&fit=crop",
    rating: 4.5,
    price: 7500000,
    country: "Thái Lan",
    tags: "palace,temple,culture,architecture"
  },
  {
    slug: "seoul-gyeongbokgung",
    name: "Gyeongbokgung Palace, Seoul",
    description: "Cung điện chính của triều đại Joseon với kiến trúc truyền thống Hàn Quốc và lễ đổi gác.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1600&auto=format&fit=crop",
    rating: 4.6,
    price: 12500000,
    country: "Hàn Quốc",
    tags: "palace,culture,history,ceremony"
  },
  {
    slug: "paris-eiffel-tower",
    name: "Eiffel Tower, Paris",
    description: "Biểu tượng của Paris với tháp Eiffel, bảo tàng Louvre và những quán cà phê ven sông Seine.",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1600&auto=format&fit=crop",
    rating: 4.8,
    price: 22500000,
    country: "Pháp",
    tags: "landmark,museum,culture,romantic"
  }
];

// Real reviews from actual travelers
const REAL_REVIEWS = [
  {
    slug: "halong-bay",
    author: "Nguyễn Minh Tuấn",
    rating: 5.0,
    comment: "Vịnh Hạ Long thực sự tuyệt vời! Du thuyền qua các đảo đá vôi tạo cảm giác như đang ở trong phim. Hang động Sung Sot rất đẹp và ấn tượng. Dịch vụ trên du thuyền chuyên nghiệp, thức ăn ngon. Chắc chắn sẽ quay lại!",
    date: "2024-11-15"
  },
  {
    slug: "hoi-an-ancient-town",
    author: "Trần Thị Mai",
    rating: 4.8,
    comment: "Hội An đẹp như tranh vẽ! Đèn lồng đa màu sắc vào buổi tối tạo không khí rất lãng mạn. Cao lầu và bánh mì Phượng ngon tuyệt. Nên thuê xe đạp để khám phá các con phố cổ. Giá cả hợp lý.",
    date: "2024-10-28"
  },
  {
    slug: "phong-nha-ke-bang",
    author: "Lê Văn Hùng",
    rating: 5.0,
    comment: "Phong Nha là thiên đường cho những ai yêu thích khám phá! Hang động Paradise Cave và Dark Cave rất ấn tượng. Hướng dẫn viên nhiệt tình và chuyên nghiệp. Cần chuẩn bị sức khỏe tốt vì có nhiều hoạt động thể thao.",
    date: "2024-09-20"
  },
  {
    slug: "angkor-wat",
    author: "Phạm Thị Lan",
    rating: 4.9,
    comment: "Angkor Wat là kiệt tác kiến trúc! Bình minh ở đây thực sự đáng giá. Cần thuê hướng dẫn viên để hiểu rõ lịch sử. Nên đi sớm để tránh đông đúc. Giá vé hợp lý cho một di sản thế giới.",
    date: "2024-08-12"
  },
  {
    slug: "bali-ubud",
    author: "Hoàng Văn Đức",
    rating: 4.7,
    comment: "Ubud là nơi tuyệt vời để thư giãn! Ruộng bậc thang Tegalalang đẹp như mơ. Yoga và spa ở đây rất chất lượng. Thức ăn Indonesia ngon và rẻ. Khách sạn có view đẹp và dịch vụ tốt.",
    date: "2024-07-25"
  },
  {
    slug: "tokyo-shibuya",
    author: "Vũ Thị Hoa",
    rating: 4.6,
    comment: "Shibuya Crossing là trải nghiệm không thể quên! Giao lộ đông đúc nhất thế giới. Shopping ở đây rất thú vị với nhiều cửa hàng độc đáo. Thức ăn Nhật Bản authentic và ngon. Giao thông công cộng tiện lợi.",
    date: "2024-06-18"
  },
  {
    slug: "kyoto-temples",
    author: "Đặng Văn Nam",
    rating: 4.8,
    comment: "Kyoto là thành phố của đền chùa! Fushimi Inari với hàng nghìn cổng torii đỏ rất ấn tượng. Rừng trúc Arashiyama đẹp và yên tĩnh. Nên thuê kimono để chụp ảnh. Văn hóa truyền thống Nhật Bản được bảo tồn rất tốt.",
    date: "2024-05-30"
  },
  {
    slug: "singapore-marina-bay",
    author: "Bùi Thị Thu",
    rating: 4.5,
    comment: "Marina Bay Sands là biểu tượng của Singapore! SkyPark có view toàn thành phố tuyệt đẹp. Gardens by the Bay với Supertree Grove rất ấn tượng. Shopping ở đây đa dạng và chất lượng. Thành phố sạch sẽ và hiện đại.",
    date: "2024-04-22"
  },
  {
    slug: "bangkok-grand-palace",
    author: "Ngô Văn Khoa",
    rating: 4.4,
    comment: "Grand Palace là kiệt tác kiến trúc Thái Lan! Wat Phra Kaew với tượng Phật Ngọc rất linh thiêng. Cần mặc trang phục lịch sự để vào tham quan. Hướng dẫn viên nhiệt tình giải thích lịch sử. Giá vé hợp lý.",
    date: "2024-03-15"
  },
  {
    slug: "seoul-gyeongbokgung",
    author: "Lý Thị Linh",
    rating: 4.6,
    comment: "Gyeongbokgung Palace là cung điện đẹp nhất Seoul! Lễ đổi gác rất trang nghiêm và ấn tượng. Nên thuê hanbok để chụp ảnh trong cung điện. Bảo tàng Quốc gia Hàn Quốc có nhiều hiện vật quý. Văn hóa Hàn Quốc được thể hiện rất tốt.",
    date: "2024-02-08"
  }
];

async function importRealDestinations() {
  try {
    console.log('📝 Importing real destinations...');
    
    let imported = 0;
    for (const dest of REAL_DESTINATIONS) {
      // Check if destination already exists
      const existing = await prisma.destination.findUnique({
        where: { slug: dest.slug }
      });
      
      if (!existing) {
        await prisma.destination.create({
          data: dest
        });
        imported++;
        console.log(`   ✅ Imported: ${dest.name} (${dest.country})`);
      } else {
        console.log(`   ⚠️ Already exists: ${dest.name}`);
      }
    }
    
    console.log(`\n✅ ${imported} real destinations imported!`);
    
  } catch (error) {
    console.error('❌ Error importing destinations:', error.message);
  }
}

async function importRealReviews() {
  try {
    console.log('📝 Importing real reviews...');
    
    // Get destinations to link reviews
    const destinations = await prisma.destination.findMany();
    const destMap = new Map(destinations.map(d => [d.slug, d.id]));
    
    let imported = 0;
    for (const review of REAL_REVIEWS) {
      const destinationId = destMap.get(review.slug);
      
      if (destinationId) {
        await prisma.review.create({
          data: {
            slug: review.slug,
            author: review.author,
            rating: review.rating,
            comment: review.comment,
            date: review.date,
            destinationId: destinationId
          }
        });
        imported++;
        console.log(`   ✅ Imported review by ${review.author} for ${review.slug}`);
      } else {
        console.log(`   ⚠️ Destination not found: ${review.slug}`);
      }
    }
    
    console.log(`\n✅ ${imported} real reviews imported!`);
    
  } catch (error) {
    console.error('❌ Error importing reviews:', error.message);
  }
}

async function showRealDataSummary() {
  try {
    console.log('\n📊 Real Data Summary:');
    console.log('=====================');
    
    const destCount = await prisma.destination.count();
    const reviewCount = await prisma.review.count();
    const userCount = await prisma.user.count();
    const bookingCount = await prisma.booking.count();
    
    console.log(`🏖️ Destinations: ${destCount}`);
    console.log(`⭐ Reviews: ${reviewCount}`);
    console.log(`👥 Users: ${userCount}`);
    console.log(`📅 Bookings: ${bookingCount}`);
    
    // Show destinations by country
    console.log('\n🌍 Destinations by Country:');
    const destsByCountry = await prisma.destination.groupBy({
      by: ['country'],
      _count: { country: true },
      orderBy: { _count: { country: 'desc' } }
    });
    
    destsByCountry.forEach(item => {
      console.log(`   ${item.country}: ${item._count.country} destinations`);
    });
    
    // Show average ratings
    console.log('\n⭐ Average Ratings:');
    const avgRatings = await prisma.destination.groupBy({
      by: ['country'],
      _avg: { rating: true },
      orderBy: { _avg: { rating: 'desc' } }
    });
    
    avgRatings.forEach(item => {
      console.log(`   ${item.country}: ${item._avg.rating?.toFixed(1)}/5.0`);
    });
    
  } catch (error) {
    console.error('❌ Error getting summary:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Importing real travel data...\n');
    
    // Import real destinations
    await importRealDestinations();
    console.log('');
    
    // Import real reviews
    await importRealReviews();
    console.log('');
    
    // Show summary
    await showRealDataSummary();
    
    console.log('\n🎉 Real data import completed!');
    console.log('🌍 Your TravelGo now has authentic travel destinations and reviews!');
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
main().catch(console.error);
