import SearchBar from "../components/SearchBar";
import Link from "next/link";
import DestinationCard from "../components/DestinationCard";
import UserInfo from "../components/UserInfo";
import { DESTINATIONS } from "../data/destinations";

export default function Home() {
  const featured = DESTINATIONS.slice(0, 9);

  return (
    <main className="container">
      {/* Hero Section */}
      <section className="relative mt-6 sm:mt-10 overflow-hidden">
        {/* Background with bright gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 rounded-3xl" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233B82F6' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }} />
        </div>

        <div className="relative px-6 py-12 sm:px-8 sm:py-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-gray-800 mb-6 shadow-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              TravelGo - Nền tảng du lịch hàng đầu
            </div>
            
            {/* Main heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Khám phá thế giới
              </span>
              <br />
              <span className="text-gray-800">
                theo cách của bạn
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
              Tìm kiếm điểm đến yêu thích, xem gợi ý và đặt chỗ nhanh chóng. 
              TravelGo đồng hành cùng mọi hành trình của bạn.
            </p>
            
            {/* Search bar */}
            <div className="mb-8">
              <SearchBar />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">500+</div>
                <div className="text-sm text-gray-700">Điểm đến</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">4.8/5</div>
                <div className="text-sm text-gray-700">Đánh giá</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600">24/7</div>
                <div className="text-sm text-gray-700">Hỗ trợ</div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Categories */}
      <section className="mt-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Khám phá theo sở thích</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Tìm kiếm điểm đến phù hợp với phong cách du lịch của bạn
          </p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { 
              title: "Biển & Resort", 
              desc: "Bãi biển đẹp, nghỉ dưỡng sang trọng", 
              href: "/destinations?tags=beach,resort",
              iconSrc: "/icons/beach.svg",
              gradient: "from-blue-400 to-cyan-400"
            },
            { 
              title: "Thành phố & Ẩm thực", 
              desc: "Văn hóa đa dạng, món ngon địa phương", 
              href: "/destinations?tags=city,food",
              iconSrc: "/icons/city.svg",
              gradient: "from-purple-400 to-pink-400"
            },
            { 
              title: "Thiên nhiên & Phiêu lưu", 
              desc: "Phong cảnh hùng vĩ, trải nghiệm độc đáo", 
              href: "/destinations?tags=nature",
              iconSrc: "/icons/mountain.svg",
              gradient: "from-green-400 to-emerald-400"
            },
          ].map((c) => (
            <a 
              key={c.title} 
              href={c.href} 
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className="relative">
                <img src={c.iconSrc} alt="" className="w-10 h-10 mb-4" />
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {c.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{c.desc}</p>
                <span className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                  Xem gợi ý 
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>
        
        {/* View All Categories */}
        <div className="text-center mt-8">
          <a 
            href="/categories" 
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Xem tất cả danh mục
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>

      {/* Featured */}
      <section className="mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Điểm đến nổi bật</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Khám phá những địa điểm du lịch được yêu thích nhất
          </p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-3">
          {featured.slice(0, 3).map((d) => (
            <DestinationCard key={d.slug} d={d} />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <a 
            href="/featured" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            Xem tất cả điểm đến nổi bật
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mt-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 sm:p-12 text-center text-white">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }} />
          </div>
          
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Sẵn sàng cho chuyến đi tiếp theo?</h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Tạo tài khoản để lưu yêu thích, quản lý đặt chỗ và nhận ưu đãi riêng.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="/signup" 
                className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Đăng ký miễn phí
              </a>
              <a 
                href="/signin" 
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Đăng nhập
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stories */}
      <section id="stories" className="mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Câu chuyện hành trình</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Những trải nghiệm thực tế từ du khách trên khắp thế giới
          </p>
        </div>
        
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              title: "Paris trong tim",
              content: "Thành phố ánh sáng lãng mạn với tháp Eiffel và những quán cà phê.",
              author: "Biên tập viên",
              authorInitial: "B",
              location: "Paris, France",
              image: "https://pystravel.vn/_next/image?url=https%3A%2F%2Fbooking.pystravel.vn%2Fuploads%2Fposts%2Falbums%2F17919%2F858fdb545681665764d10bb6b3ff8aea.jpg&w=1920&q=75"
            },
            {
              title: "Tokyo hiện đại",
              content: "Sự kết hợp hoàn hảo giữa truyền thống và công nghệ ở Tokyo.",
              author: "Biên tập viên",
              authorInitial: "B",
              location: "Tokyo, Japan",
              image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop"
            },
            {
              title: "Kyoto cổ kính",
              content: "Đền chùa, rừng trúc Arashiyama và văn hóa truyền thống Nhật Bản.",
              author: "Biên tập viên",
              authorInitial: "B",
              location: "Kyoto, Japan",
              image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop"
            }
          ].map((story, i) => (
            <article key={i} className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={story.image} 
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {story.location}
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {story.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {story.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {story.authorInitial}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{story.author}</span>
                  </div>
                  <Link 
                    href="/destinations" 
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    Đọc thêm →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        
        {/* View All Stories */}
        <div className="text-center mt-12">
          <a 
            href="/stories" 
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Xem tất cả câu chuyện
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>
    </main>
  );
}
