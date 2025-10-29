#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('🌱 Seeding TravelGo Database');
console.log('============================');

// Sample destinations data
const DESTINATIONS = [
  {
    slug: "ninh-binh",
    name: "Ninh Bình",
    description: "Di sản Tràng An, Tam Cốc – Bích Động, hang động và non nước hữu tình.",
    image: "https://nld.mediacdn.vn/zoom/700_438/291774122806476800/2025/3/7/15-a2-ben-thuyen-trang-an-1665667639183182647777-17413230377291630806033-0-52-661-1110-crop-1741323187515109427004.jpg",
    rating: 4.7,
    price: 5900000,
    country: "Việt Nam",
    tags: "nature,adventure,romantic"
  },
  {
    slug: "ha-long",
    name: "Hạ Long",
    description: "Vịnh Hạ Long – kỳ quan thiên nhiên thế giới với du thuyền và hang động.",
    image: "https://hoangkimtravels.com/upload/product/bali-kintamani-d-tukad-club--4-ngay-3-dem-41.jpg",
    rating: 4.8,
    price: 7900000,
    country: "Việt Nam",
    tags: "nature,resort,luxury"
  },
  {
    slug: "da-lat",
    name: "Đà Lạt",
    description: "Thành phố sương mù, hoa và những nông trại – khí hậu mát mẻ quanh năm.",
    image: "https://image.vietgoing.com/article/large/8-diem-du-lich-chup-hinh-dep-nhat-o-da-lat.jpg",
    rating: 4.6,
    price: 6200000,
    country: "Việt Nam",
    tags: "nature,romantic,food"
  },
  {
    slug: "phu-quoc",
    name: "Phú Quốc",
    description: "Thiên đường nghỉ dưỡng với biển xanh, cát trắng và resort cao cấp.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1600&auto=format&fit=crop",
    rating: 4.7,
    price: 10900000,
    country: "Việt Nam",
    tags: "beach,resort,luxury"
  },
  {
    slug: "phuket",
    name: "Phuket",
    description: "Hòn đảo nổi tiếng của Thái Lan – biển đẹp, tiệc tùng và hoạt động biển.",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1600&auto=format&fit=crop",
    rating: 4.5,
    price: 9900000,
    country: "Thái Lan",
    tags: "beach,entertainment,food"
  },
  {
    slug: "kyoto",
    name: "Kyoto",
    description: "Cố đô Nhật Bản với đền chùa, rừng trúc Arashiyama và văn hóa truyền thống.",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1600&auto=format&fit=crop",
    rating: 4.8,
    price: 23900000,
    country: "Nhật Bản",
    tags: "history,culture,museum"
  },
  {
    slug: "paris",
    name: "Paris",
    description: "Kinh đô ánh sáng với tháp Eiffel, bảo tàng Louvre và những quán cà phê ven đường.",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1600&auto=format&fit=crop",
    rating: 4.8,
    price: 19900000,
    country: "Pháp",
    tags: "romantic,city,museum"
  },
  {
    slug: "bali",
    name: "Bali",
    description: "Thiên đường nhiệt đới của Indonesia, nổi tiếng với ruộng bậc thang, đền cổ và bãi biển.",
    image: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1600&auto=format&fit=crop",
    rating: 4.9,
    price: 15900000,
    country: "Indonesia",
    tags: "beach,resort,nature"
  }
];

// Sample reviews data
const REVIEWS = [
  {
    slug: "ha-long",
    author: "Minh",
    rating: 4.6,
    comment: "Vịnh Hạ Long tuyệt đẹp, du thuyền rất thoải mái.",
    date: "2024-07-12"
  },
  {
    slug: "da-lat",
    author: "Lan",
    rating: 4.7,
    comment: "Khí hậu mát mẻ, cảnh đẹp như tranh vẽ.",
    date: "2024-08-01"
  },
  {
    slug: "paris",
    author: "Khoa",
    rating: 4.9,
    comment: "Bảo tàng Louvre và tháp Eiffel không thể bỏ lỡ.",
    date: "2024-06-20"
  },
  {
    slug: "bali",
    author: "Linh",
    rating: 4.8,
    comment: "Thiên nhiên tuyệt vời, dịch vụ tốt.",
    date: "2024-05-15"
  },
  {
    slug: "kyoto",
    author: "Huy",
    rating: 4.7,
    comment: "Hiện đại nhưng vẫn giữ nét truyền thống.",
    date: "2024-09-09"
  }
];

async function seedDestinations() {
  try {
    console.log('📝 Seeding destinations...');
    
    // Check if destinations already exist
    const existingCount = await prisma.destination.count();
    if (existingCount > 0) {
      console.log(`✅ ${existingCount} destinations already exist`);
      return;
    }
    
    // Insert destinations
    for (const dest of DESTINATIONS) {
      await prisma.destination.create({
        data: dest
      });
    }
    
    console.log(`✅ ${DESTINATIONS.length} destinations seeded successfully!`);
    
  } catch (error) {
    console.error('❌ Error seeding destinations:', error.message);
  }
}

async function seedReviews() {
  try {
    console.log('📝 Seeding reviews...');
    
    // Check if reviews already exist
    const existingCount = await prisma.review.count();
    if (existingCount > 0) {
      console.log(`✅ ${existingCount} reviews already exist`);
      return;
    }
    
    // Get destinations to link reviews
    const destinations = await prisma.destination.findMany();
    const destMap = new Map(destinations.map(d => [d.slug, d.id]));
    
    // Insert reviews
    for (const review of REVIEWS) {
      const destinationId = destMap.get(review.slug);
      
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
    }
    
    console.log(`✅ ${REVIEWS.length} reviews seeded successfully!`);
    
  } catch (error) {
    console.error('❌ Error seeding reviews:', error.message);
  }
}

async function seedSampleCoupons() {
  try {
    console.log('📝 Seeding sample coupons...');
    
    // Check if coupons already exist
    const existingCount = await prisma.coupon.count();
    if (existingCount > 0) {
      console.log(`✅ ${existingCount} coupons already exist`);
      return;
    }
    
    const sampleCoupons = [
      {
        code: 'WELCOME10',
        name: 'Welcome Discount',
        description: '10% off for new customers',
        type: 'percentage',
        value: 10,
        minOrderAmount: 1000000,
        maxDiscountAmount: 500000,
        usageLimit: 100,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true
      },
      {
        code: 'SUMMER2024',
        name: 'Summer Special',
        description: '500,000 VND off for summer destinations',
        type: 'fixed',
        value: 500000,
        minOrderAmount: 2000000,
        usageLimit: 50,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        isActive: true
      },
      {
        code: 'VIP20',
        name: 'VIP Member',
        description: '20% off for VIP members',
        type: 'percentage',
        value: 20,
        minOrderAmount: 5000000,
        maxDiscountAmount: 2000000,
        usageLimit: 20,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        isActive: true
      }
    ];
    
    for (const coupon of sampleCoupons) {
      await prisma.coupon.create({
        data: coupon
      });
    }
    
    console.log(`✅ ${sampleCoupons.length} sample coupons seeded successfully!`);
    
  } catch (error) {
    console.error('❌ Error seeding coupons:', error.message);
  }
}

async function showDataSummary() {
  try {
    console.log('\n📊 Data Summary:');
    console.log('================');
    
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
    
  } catch (error) {
    console.error('❌ Error getting data summary:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting database seeding...\n');
    
    // Seed destinations
    await seedDestinations();
    console.log('');
    
    // Seed reviews
    await seedReviews();
    console.log('');
    
    // Seed sample coupons
    await seedSampleCoupons();
    console.log('');
    
    // Show summary
    await showDataSummary();
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('🚀 You can now use the application with sample data');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
main().catch(console.error);