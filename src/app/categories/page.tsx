import Link from "next/link";
import {
  SunIcon,
  BuildingOffice2Icon,
  GlobeAltIcon,
  SparklesIcon,
  BuildingLibraryIcon,
  HeartIcon,
  UsersIcon,
  AdjustmentsHorizontalIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

export default function CategoriesPage() {
  const categories = [
    { 
      title: "Biển & Resort", 
      desc: "Bãi biển đẹp, nghỉ dưỡng sang trọng", 
      href: "/destinations?tags=beach,resort",
      Icon: SunIcon,
      gradient: "from-blue-400 to-cyan-400",
      count: "150+ điểm đến",
      features: ["Bãi biển tuyệt đẹp", "Resort 5 sao", "Hoạt động dưới nước"],
      popular: ["Phuket", "Bali", "Maldives"]
    },
    { 
      title: "Thành phố & Văn hóa", 
      desc: "Khám phá văn hóa, lịch sử, ẩm thực", 
      href: "/destinations?tags=city,culture",
      Icon: BuildingOffice2Icon,
      gradient: "from-purple-400 to-pink-400",
      count: "200+ điểm đến",
      features: ["Bảo tàng nổi tiếng", "Ẩm thực địa phương", "Kiến trúc cổ kính"],
      popular: ["Tokyo", "Paris", "Rome"]
    },
    { 
      title: "Thiên nhiên & Mạo hiểm", 
      desc: "Núi rừng, trekking, khám phá hoang dã", 
      href: "/destinations?tags=nature,adventure",
      Icon: GlobeAltIcon,
      gradient: "from-green-400 to-emerald-400",
      count: "100+ điểm đến",
      features: ["Trekking", "Leo núi", "Khám phá hoang dã"],
      popular: ["Nepal", "New Zealand", "Costa Rica"]
    },
    { 
      title: "Ẩm thực & Trải nghiệm", 
      desc: "Khám phá ẩm thực địa phương độc đáo", 
      href: "/destinations?tags=food,experience",
      Icon: SparklesIcon,
      gradient: "from-orange-400 to-red-400",
      count: "80+ điểm đến",
      features: ["Ẩm thực đường phố", "Lớp học nấu ăn", "Thị trường địa phương"],
      popular: ["Thailand", "Italy", "Japan"]
    },
    { 
      title: "Lịch sử & Di sản", 
      desc: "Khám phá những di tích lịch sử cổ đại", 
      href: "/destinations?tags=history,heritage",
      Icon: BuildingLibraryIcon,
      gradient: "from-amber-400 to-yellow-400",
      count: "120+ điểm đến",
      features: ["Di tích cổ đại", "Bảo tàng lịch sử", "Kiến trúc cổ"],
      popular: ["Egypt", "Greece", "Cambodia"]
    },
    { 
      title: "Lãng mạn & Honeymoon", 
      desc: "Những điểm đến lãng mạn cho cặp đôi", 
      href: "/destinations?tags=romantic,honeymoon",
      Icon: HeartIcon,
      gradient: "from-pink-400 to-rose-400",
      count: "60+ điểm đến",
      features: ["Resort lãng mạn", "Hoàng hôn tuyệt đẹp", "Dịch vụ spa"],
      popular: ["Maldives", "Santorini", "Bora Bora"]
    },
    { 
      title: "Gia đình & Trẻ em", 
      desc: "Điểm đến phù hợp cho cả gia đình", 
      href: "/destinations?tags=family,kids",
      Icon: UsersIcon,
      gradient: "from-indigo-400 to-blue-400",
      count: "90+ điểm đến",
      features: ["Công viên giải trí", "Bãi biển an toàn", "Hoạt động gia đình"],
      popular: ["Disney", "Singapore", "Australia"]
    },
    { 
      title: "Tâm linh & Thiền định", 
      desc: "Tìm kiếm sự bình yên và cân bằng", 
      href: "/destinations?tags=spiritual,meditation",
      Icon: AdjustmentsHorizontalIcon,
      gradient: "from-teal-400 to-green-400",
      count: "40+ điểm đến",
      features: ["Thiền viện", "Yoga retreat", "Không gian yên tĩnh"],
      popular: ["India", "Tibet", "Bhutan"]
    },
    { 
      title: "Thể thao & Hoạt động", 
      desc: "Các hoạt động thể thao và giải trí", 
      href: "/destinations?tags=sports,activities",
      Icon: TrophyIcon,
      gradient: "from-red-400 to-orange-400",
      count: "70+ điểm đến",
      features: ["Thể thao mạo hiểm", "Golf", "Trượt tuyết"],
      popular: ["Switzerland", "New Zealand", "Canada"]
    }
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }} />
        </div>
        
        <div className="relative container py-16 sm:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Khám phá theo sở thích
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Tìm điểm đến
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                phù hợp với bạn
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Chọn danh mục yêu thích và khám phá những điểm đến tuyệt vời được gợi ý dành riêng cho bạn
            </p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 sm:py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Danh mục du lịch</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Mỗi danh mục mang đến những trải nghiệm độc đáo và đáng nhớ
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {categories.map((category, index) => (
              <Link 
                key={index}
                href={category.href} 
                className="group relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105"
              >
                {/* Background Pattern */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <div className="relative p-8">
                  {/* Icon */}
                  <div className="mb-6 flex items-center justify-center">
                    {category.Icon && <category.Icon className="h-12 w-12 text-gray-900 dark:text-white" />}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-3 text-center text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {category.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
                    {category.desc}
                  </p>
                  
                  {/* Count */}
                  <div className="text-center mb-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {category.count}
                    </span>
                  </div>
                  
                  {/* Features */}
                  <div className="space-y-2 mb-4">
                    {category.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  {/* Popular Destinations */}
                  <div className="mb-6">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Điểm đến nổi bật:</div>
                    <div className="flex flex-wrap gap-1">
                      {category.popular.map((dest, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                          {dest}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* CTA */}
                  <div className="text-center">
                    <span className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                      Khám phá ngay
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose TravelGo Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Tại sao chọn TravelGo?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Chúng tôi cam kết mang đến những trải nghiệm du lịch tuyệt vời nhất
            </p>
          </div>
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Đảm bảo chất lượng</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Tất cả điểm đến đều được kiểm duyệt kỹ lưỡng</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Giá cả hợp lý</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Cam kết giá tốt nhất thị trường</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Hỗ trợ 24/7</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Đội ngũ chăm sóc khách hàng chuyên nghiệp</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Trải nghiệm cá nhân</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Gợi ý phù hợp với sở thích của bạn</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">850+</div>
              <div className="text-gray-600 dark:text-gray-400">Điểm đến</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">80+</div>
              <div className="text-gray-600 dark:text-gray-400">Quốc gia</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">25K+</div>
              <div className="text-gray-600 dark:text-gray-400">Khách hàng</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">9</div>
              <div className="text-gray-600 dark:text-gray-400">Danh mục</div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <section className="py-16">
        <div className="container text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại trang chủ
          </Link>
        </div>
      </section>
    </main>
  );
}
