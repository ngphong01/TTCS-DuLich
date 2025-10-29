import { DESTINATIONS } from "@/data/destinations";
import DestinationCard from "@/components/DestinationCard";
import Link from "next/link";

export default function FeaturedPage() {
  // Lọc và sắp xếp destinations theo rating cao nhất
  const featured = DESTINATIONS
    .filter(d => d.rating >= 4.5) // Chỉ lấy những điểm có rating >= 4.5
    .sort((a, b) => b.rating - a.rating) // Sắp xếp theo rating giảm dần
    .slice(0, 12); // Lấy 12 điểm tốt nhất

  // Phân loại theo loại hình du lịch
  const beachDestinations = featured.filter(d => d.tags.includes('beach')).slice(0, 4);
  const cityDestinations = featured.filter(d => d.tags.includes('city')).slice(0, 4);
  const natureDestinations = featured.filter(d => d.tags.includes('nature')).slice(0, 4);

  return (
    <main className="min-h-screen overflow-x-hidden">
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
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              Điểm đến nổi bật
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Khám phá thế giới
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                qua những điểm đến tuyệt vời
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Tuyển chọn những địa điểm du lịch được yêu thích nhất từ khắp thế giới, 
              mang đến trải nghiệm đáng nhớ cho mọi hành trình
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{featured.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Điểm đến nổi bật</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                  {(featured.reduce((sum, d) => sum + d.rating, 0) / featured.length).toFixed(1)}/5
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Đánh giá trung bình</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {new Set(featured.map(d => d.country)).size}+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Quốc gia</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Rated Destinations */}
      <section className="py-16 sm:py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Điểm đến được đánh giá cao nhất</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Những địa điểm du lịch có rating từ 4.5⭐ trở lên, được lựa chọn kỹ lưỡng
            </p>
          </div>
          
          {/* Top Destinations Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto mb-16">
            {featured.slice(0, 6).map((d) => (
              <DestinationCard key={d.slug} d={d} />
            ))}
          </div>
        </div>
      </section>

      {/* Beach Destinations */}
      {beachDestinations.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <div className="container">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                <span className="text-2xl">🏖️</span>
                Biển & Resort
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Bãi biển tuyệt đẹp</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Những bãi biển được đánh giá cao nhất với nước trong xanh và cát trắng mịn
              </p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {beachDestinations.map((d) => (
                <DestinationCard key={d.slug} d={d} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* City Destinations */}
      {cityDestinations.length > 0 && (
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                <span className="text-2xl">🏙️</span>
                Thành phố & Văn hóa
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Thành phố nổi tiếng</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Khám phá những thành phố sôi động với văn hóa đa dạng và ẩm thực phong phú
              </p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {cityDestinations.map((d) => (
                <DestinationCard key={d.slug} d={d} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Nature Destinations */}
      {natureDestinations.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="container">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                <span className="text-2xl">🏔️</span>
                Thiên nhiên & Mạo hiểm
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Thiên nhiên hoang dã</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Trải nghiệm thiên nhiên nguyên sơ với những cảnh quan tuyệt đẹp
              </p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {natureDestinations.map((d) => (
                <DestinationCard key={d.slug} d={d} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* View All Destinations */}
      <section className="py-16">
        <div className="container text-center">
          <Link 
            href="/destinations" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            Xem tất cả điểm đến
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Tại sao chọn TravelGo?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Chúng tôi cam kết mang đến những trải nghiệm du lịch tốt nhất
            </p>
          </div>
          
          <div className="grid gap-8 sm:grid-cols-3 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Chất lượng đảm bảo</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tất cả điểm đến đều được kiểm duyệt kỹ lưỡng và đánh giá cao
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Hỗ trợ 24/7</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Trải nghiệm tuyệt vời</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tạo ra những kỷ niệm đáng nhớ trong mọi chuyến đi
              </p>
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
