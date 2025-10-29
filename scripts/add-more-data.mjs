#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('🌱 Adding More TravelGo Data');
console.log('=============================');

// Extended destinations data
const MORE_DESTINATIONS = [
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
  },
  {
    slug: "tokyo",
    name: "Tokyo",
    description: "Thủ đô hiện đại của Nhật Bản với công nghệ, ẩm thực và văn hóa pop.",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1600&auto=format&fit=crop",
    rating: 4.6,
    price: 18900000,
    country: "Nhật Bản",
    tags: "city,technology,food"
  },
  {
    slug: "singapore",
    name: "Singapore",
    description: "Quốc đảo sạch sẽ với Marina Bay Sands, Gardens by the Bay và ẩm thực đa dạng.",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1600&auto=format&fit=crop",
    rating: 4.7,
    price: 12900000,
    country: "Singapore",
    tags: "city,modern,food"
  },
  {
    slug: "bangkok",
    name: "Bangkok",
    description: "Thủ đô sôi động của Thái Lan với chùa vàng, chợ nổi và ẩm thực đường phố.",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1600&auto=format&fit=crop",
    rating: 4.4,
    price: 7900000,
    country: "Thái Lan",
    tags: "city,culture,food"
  },
  {
    slug: "seoul",
    name: "Seoul",
    description: "Thủ đô Hàn Quốc với cung điện cổ, K-pop và ẩm thực Hàn Quốc.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1600&auto=format&fit=crop",
    rating: 4.5,
    price: 14900000,
    country: "Hàn Quốc",
    tags: "city,culture,entertainment"
  },
  {
    slug: "hoi-an",
    name: "Hội An",
    description: "Phố cổ Hội An với đèn lồng, áo dài và ẩm thực đặc sản.",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1600&auto=format&fit=crop",
    rating: 4.6,
    price: 4200000,
    country: "Việt Nam",
    tags: "culture,romantic,food"
  }
];

// More reviews
const MORE_REVIEWS = [
  {
    slug: "phu-quoc",
    author: "Minh",
    rating: 4.8,
    comment: "Biển đẹp tuyệt vời, resort sang trọng.",
    date: "2024-07-15"
  },
  {
    slug: "phuket",
    author: "Lan",
    rating: 4.5,
    comment: "Hoạt động biển thú vị, thức ăn ngon.",
    date: "2024-08-10"
  },
  {
    slug: "kyoto",
    author: "Khoa",
    rating: 4.9,
    comment: "Văn hóa truyền thống Nhật Bản rất đẹp.",
    date: "2024-06-25"
  },
  {
    slug: "paris",
    author: "Linh",
    rating: 4.7,
    comment: "Tháp Eiffel và bảo tàng Louvre tuyệt vời.",
    date: "2024-05-20"
  },
  {
    slug: "bali",
    author: "Huy",
    rating: 4.8,
    comment: "Thiên nhiên và resort đẳng cấp thế giới.",
    date: "2024-09-15"
  },
  {
    slug: "tokyo",
    author: "Mai",
    rating: 4.6,
    comment: "Công nghệ hiện đại và ẩm thực đa dạng.",
    date: "2024-10-01"
  },
  {
    slug: "singapore",
    author: "Nam",
    rating: 4.7,
    comment: "Thành phố sạch sẽ và hiện đại.",
    date: "2024-11-05"
  },
  {
    slug: "bangkok",
    author: "Thu",
    rating: 4.4,
    comment: "Chợ nổi và ẩm thực đường phố hấp dẫn.",
    date: "2024-12-10"
  },
  {
    slug: "seoul",
    author: "Duc",
    rating: 4.5,
    comment: "K-pop và ẩm thực Hàn Quốc tuyệt vời.",
    date: "2024-01-15"
  },
  {
    slug: "hoi-an",
    author: "Hoa",
    rating: 4.6,
    comment: "Phố cổ đẹp như tranh vẽ, đèn lồng lung linh.",
    date: "2024-02-20"
  }
];

async function addMoreDestinations() {
  try {
    console.log('📝 Adding more destinations...');
    
    let added = 0;
    for (const dest of MORE_DESTINATIONS) {
      // Check if destination already exists
      const existing = await prisma.destination.findUnique({
        where: { slug: dest.slug }
      });
      
      if (!existing) {
        await prisma.destination.create({
          data: dest
        });
        added++;
      }
    }
    
    console.log(`✅ ${added} new destinations added!`);
    
  } catch (error) {
    console.error('❌ Error adding destinations:', error.message);
  }
}

async function addMoreReviews() {
  try {
    console.log('📝 Adding more reviews...');
    
    // Get destinations to link reviews
    const destinations = await prisma.destination.findMany();
    const destMap = new Map(destinations.map(d => [d.slug, d.id]));
    
    let added = 0;
    for (const review of MORE_REVIEWS) {
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
        added++;
      }
    }
    
    console.log(`✅ ${added} new reviews added!`);
    
  } catch (error) {
    console.error('❌ Error adding reviews:', error.message);
  }
}

async function addMoreCoupons() {
  try {
    console.log('📝 Adding more coupons...');
    
    const moreCoupons = [
      {
        code: 'EARLYBIRD',
        name: 'Early Bird',
        description: '15% off for early bookings',
        type: 'percentage',
        value: 15,
        minOrderAmount: 3000000,
        maxDiscountAmount: 1000000,
        usageLimit: 30,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      {
        code: 'FAMILY500',
        name: 'Family Package',
        description: '500,000 VND off for family trips',
        type: 'fixed',
        value: 500000,
        minOrderAmount: 5000000,
        usageLimit: 25,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      {
        code: 'STUDENT15',
        name: 'Student Discount',
        description: '15% off for students',
        type: 'percentage',
        value: 15,
        minOrderAmount: 2000000,
        maxDiscountAmount: 800000,
        usageLimit: 50,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      {
        code: 'GROUP20',
        name: 'Group Travel',
        description: '20% off for groups of 4+',
        type: 'percentage',
        value: 20,
        minOrderAmount: 8000000,
        maxDiscountAmount: 3000000,
        usageLimit: 15,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true
      }
    ];
    
    let added = 0;
    for (const coupon of moreCoupons) {
      // Check if coupon already exists
      const existing = await prisma.coupon.findUnique({
        where: { code: coupon.code }
      });
      
      if (!existing) {
        await prisma.coupon.create({
          data: coupon
        });
        added++;
      }
    }
    
    console.log(`✅ ${added} new coupons added!`);
    
  } catch (error) {
    console.error('❌ Error adding coupons:', error.message);
  }
}

async function showFinalSummary() {
  try {
    console.log('\n📊 Final Data Summary:');
    console.log('=====================');
    
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
    
    // Show destinations by country
    console.log('\n🌍 Destinations by Country:');
    const destsByCountry = await prisma.destination.groupBy({
      by: ['country'],
      _count: { country: true }
    });
    
    destsByCountry.forEach(item => {
      console.log(`   ${item.country}: ${item._count.country} destinations`);
    });
    
  } catch (error) {
    console.error('❌ Error getting final summary:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Adding more data to TravelGo...\n');
    
    // Add more destinations
    await addMoreDestinations();
    console.log('');
    
    // Add more reviews
    await addMoreReviews();
    console.log('');
    
    // Add more coupons
    await addMoreCoupons();
    console.log('');
    
    // Show final summary
    await showFinalSummary();
    
    console.log('\n🎉 More data added successfully!');
    console.log('🚀 Your TravelGo now has much more content!');
    
  } catch (error) {
    console.error('❌ Adding data failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main().catch(console.error);
